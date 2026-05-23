import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

// 🗄️ Our temporary filing cabinet to save generated documents in memory
const memoryStorage = {};

// Helper to convert file buffer for Gemini
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// 1. GENERATE ENDPOINT
router.post('/generate', upload.any(), async (req, res) => {
  try {
    console.log("👉 /generate endpoint reached!");

    const jobDescription = req.body.jobDescription || '';
    const language = req.body.languageSelection || 'German';
    const resumeFile = req.files && req.files.find(f => f.fieldname === 'resumeFile');

    if (!jobDescription) {
      return res.status(400).json({ error: "Missing job description." });
    }

    const textPrompt = `
      You are an expert AI Job Optimizer. Analyze the attached resume and the provided Job Description.
      Generate a customized response package structured in valid JSON format:
      1. An optimized, tailored cover letter text matching the target output language: "${language}".
      2. A list of 4-6 key technical matching skill keywords extracted from the job description.
      3. A list of 2-3 explicit ATS structural suggestions to improve the candidate's resume match profile.

      CRITICAL: Return ONLY raw valid JSON text matching this exact format. No markdown, no triple backticks.
      {
        "coverLetterPreview": "Your generated letter goes here...",
        "keywords": ["Keyword1", "Keyword2"],
        "atsSuggestions": ["Suggestion 1", "Suggestion 2"]
      }

      Target Job Description:
      ${jobDescription}
    `;

    let aiContents = [textPrompt];
    if (resumeFile) {
      aiContents.push(fileToGenerativePart(resumeFile.buffer, resumeFile.mimetype));
    }

    console.log("🧠 Querying Gemini API...");
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: aiContents,
    });

    const cleanText = response.text.trim();
    const parsedData = JSON.parse(cleanText);

    // Create a unique tracking ID for this generation run
    const trackingId = `track_${Date.now()}`;

    // 🗄️ SAVE THE DATA IN OUR FILING CABINET BEFORE SENDING IT TO THE FRONTEND
    memoryStorage[trackingId] = {
      coverLetter: parsedData.coverLetterPreview,
      optimizedCvDraft: `ATS Optimization Suggestions Applied:\n${parsedData.atsSuggestions.join('\n')}`
    };

    console.log(`💾 Saved assets to server memory under ID: ${trackingId}`);

    res.json({
      trackingId: trackingId,
      preview: parsedData
    });

  } catch (error) {
    console.error("Pipeline AI generation crash:", error);
    res.status(500).json({ error: "Processing engine failure during AI generation." });
  }
});


// 2. MOCK VERIFICATION UNLOCK ENDPOINT
// Your frontend app.js calls ApiClient.verifyUnlock() after a transaction simulation.
// This endpoint moves the document from "preview" status to "fully unlocked".
router.post('/verify-unlock', (req, res) => {
  const { trackingId } = req.body;
  console.log(`🔓 Unlocking full assets request for ID: ${trackingId}`);
  
  const savedDoc = memoryStorage[trackingId];
  if (!savedDoc) {
    return res.status(404).json({ error: "Document package assets tracking target not found." });
  }

  // Send back the full text assets that app.js is waiting to reveal
  res.json({
    success: true,
    payload: {
      coverLetter: savedDoc.coverLetter,
      optimizedCvDraft: savedDoc.optimizedCvDraft
    }
  });
});


// 3. DOWNLOAD TEXT ENDPOINT
// This handles requests like: /api/ai/download/txt/coverletter/track_12345
router.get('/download/txt/:docType/:trackingId', (req, res) => {
  const { docType, trackingId } = req.params;
  console.log(`📥 Download requested for document type: ${docType}, ID: ${trackingId}`);

  const savedDoc = memoryStorage[trackingId];
  if (!savedDoc) {
    return res.status(404).send("Document not found or expired.");
  }

  // Determine which text segment to pull out of our cabinet
  let textToSend = docType === 'coverletter' ? savedDoc.coverLetter : savedDoc.optimizedCvDraft;
  let filename = docType === 'coverletter' ? 'Anschreiben.txt' : 'ATS_Suggestions.txt';

  // Tell the browser that this response is a file download attachment
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  
  // Shoot the text content directly into the file stream download
  res.send(textToSend);
});

export default router;