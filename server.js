const express = require('express');
const cors = require('cors');
const fileUpload = require('express-fileupload'); // Add binary upload support
const pdfParse = require('pdf-parse/lib/pdf-parse.js'); // Updated working import path
const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "placeholder" });

// Global Middleware Config
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload()); // Enables parsing of multi-part form data
app.use(express.static('public'));

app.post('/api/generate-application', async (req, res) => {
    console.log(`\n[${new Date().toLocaleTimeString()}] [INCOMING DATA]: Parsing application bundle raw transmission...`);
    
    // 1. Extract plain text data fields
    const { jobDescription, inputLanguage, paymentId } = req.body;
    let extractedCvText = "";

    // 2. Validate Payment Wall
    if (!paymentId) {
        console.warn(`[${new Date().toLocaleTimeString()}] [REJECTED]: Missing payment transaction token.`);
        return res.status(402).json({ error: "Payment clearance required to process documents." });
    }

    // 3. Extract Text from PDF File
    try {
        if (!req.files || !req.files.cvFile) {
            console.warn(`[${new Date().toLocaleTimeString()}] [REJECTED]: No CV PDF file attachment detected.`);
            return res.status(400).json({ error: "Please upload your CV as a valid PDF document." });
        }

        const pdfBuffer = req.files.cvFile.data;
        const parsedPdf = await pdfParse(pdfBuffer);
        extractedCvText = parsedPdf.text;
        
        console.log(`[${new Date().toLocaleTimeString()}] [PDF SYSTEM]: Successfully parsed ${parsedPdf.numpages} pages of CV data.`);
    } catch (pdfError) {
        console.error(`[${new Date().toLocaleTimeString()}] [PDF ERROR]: Failed parsing binary stream:`, pdfError.message);
        return res.status(500).json({ error: "Failed to read file format. Ensure the uploaded file is a valid PDF." });
    }

    // 4. Validate Final Content Payload
    if (!extractedCvText.trim() || !jobDescription) {
        return res.status(400).json({ error: "Missing content. Ensure job description is filled and PDF is not empty." });
    }

    const prompt = `
    You are an expert ATS recruitment optimizer and professional corporate German copywriter.
    The user's original CV is written in ${inputLanguage || 'English'}.
    
    Analyze the following extracted user CV and the target German job description to generate a matching application bundle.
    
    === GERMAN COVER LETTER (ANSCHREIBEN) ===
    Write a formal, premium German cover letter tailored perfectly to this job profile. 
    Ensure a confident, professional tone using high-level business phrases.
    
    === GERMAN CV PHRASES & CORE SKILLS ===
    Translate and rewrite the user's primary professional experiences and technical stack from their CV into impactful German technical phrasing optimized for local human resource scanners.
    
    User CV Text (Extracted from PDF):
    ${extractedCvText}
    
    Target Job Description:
    ${jobDescription}
    
    Output Constraint: Return ONLY the raw output for the documents. Do not include conversational AI commentary.
    `;

    try {
        console.log(`[${new Date().toLocaleTimeString()}] [AI CONNECTION]: Handing payload to free Gemini engine...`);
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        console.log(`[${new Date().toLocaleTimeString()}] [SUCCESS]: Generation payload created successfully.`);
        res.json({ success: true, data: response.text });

    } catch (error) {
        console.error(`[${new Date().toLocaleTimeString()}] [ENGINE ERROR]:`, error.message);
        res.status(500).json({ error: "The AI engine failed to process the text. Please check server console logs." });
    }
});

app.listen(PORT, () => {
    console.log(`===================================================`);
    console.log(`[SYSTEM UPGRADED]: PDF Engine active on port ${PORT}`);
    console.log(`===================================================`);
});