import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import pdfService from '../services/pdfService.js';

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

// 🗄️ Our temporary filing cabinet to save generated documents in memory
const memoryStorage = {};

// Helper to convert file buffer for Gemini pipeline execution
function fileToGenerativePart(buffer, mimeType) {
  return {
    inlineData: {
      data: buffer.toString("base64"),
      mimeType
    },
  };
}

// ==========================================
// 1. GENERATE ENDPOINT
// ==========================================
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
SYSTEM ROLE:
You are an expert resume strategist and ATS optimization assistant.

TASK:
Analyze:
1. The uploaded resume
2. The target job description

Generate:
- a tailored professional cover letter
- ATS keyword matches
- actionable ATS optimization suggestions

OUTPUT LANGUAGE:
${language}

STRICT OUTPUT RULES:
- Return ONLY valid raw JSON matching the required schema layout exactly
- Do NOT include any intro or outro text snippets
- Escape all quotes correctly

REQUIRED JSON SCHEMA:
{
  "coverLetter": {
    "senderName": "string",
    "senderContact": "string (Email, Phone, Location)",
    "recipientCompany": "string",
    "subjectLine": "string",
    "salutation": "string",
    "bodyParagraphs": ["string", "string", "string"],
    "signOff": "string"
  },
  "tailoredCV": {
    "fullName": "string",
    "professionalTitle": "string",
    "summary": "string",
    "tailoredExperience": [
      {
        "role": "string",
        "company": "string",
        "duration": "string",
        "achievements": ["string", "string"]
      }
    ],
    "atsKeywordsMatched": ["string"]
  }
}

TARGET JOB DESCRIPTION:
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

    let rawText = response.text.trim();
    
    if (rawText.startsWith("```")) {
      rawText = rawText.replace(/^```json\s*/i, "").replace(/```$/, "").trim();
    }

    const parsedData = JSON.parse(rawText);
    const trackingId = `track_${Date.now()}`;

    const clData = parsedData.coverLetter || {};
    const cvData = parsedData.tailoredCV || {};

    memoryStorage[trackingId] = {
      coverLetter: {
        senderName: clData.senderName || '',
        senderContact: clData.senderContact || '',
        recipientCompany: clData.recipientCompany || '',
        subjectLine: clData.subjectLine || '',
        salutation: clData.salutation || '',
        bodyParagraphs: Array.isArray(clData.bodyParagraphs) ? clData.bodyParagraphs : [],
        signOff: clData.signOff || ''
      },
      tailoredCV: {
        fullName: cvData.fullName || '',
        professionalTitle: cvData.professionalTitle || '',
        summary: cvData.summary || '',
        tailoredExperience: Array.isArray(cvData.tailoredExperience) ? cvData.tailoredExperience : [],
        atsKeywordsMatched: Array.isArray(cvData.atsKeywordsMatched) ? cvData.atsKeywordsMatched : []
      }
    };

    console.log(`💾 Saved structured assets to server memory under ID: ${trackingId}`);

    res.json({
      trackingId: trackingId,
      preview: memoryStorage[trackingId]
    });

  } catch (error) {
    console.error("Pipeline AI generation crash:", error);
    res.status(500).json({ error: "Processing engine failure during AI generation." });
  }
});

// ==========================================
// 2. VERIFY UNLOCK ENDPOINT
// ==========================================
router.post('/verify-unlock', (req, res) => {
  const { trackingId } = req.body;
  console.log(`🔓 Unlocking full assets request for ID: ${trackingId}`);
  
  const savedDoc = memoryStorage[trackingId];
  if (!savedDoc) {
    return res.status(404).json({ error: "Document package assets tracking target not found." });
  }

  res.json({
    success: true,
    payload: {
      coverLetter: savedDoc.coverLetter,
      tailoredCV: savedDoc.tailoredCV
    }
  });
});

// ==========================================
// 3. DOWNLOAD TEXT ENDPOINT
// ==========================================
router.get('/download/txt/:docType/:trackingId', (req, res) => {
  const { docType, trackingId } = req.params;
  console.log(`📥 Download requested for document type: ${docType}, ID: ${trackingId}`);

  const savedDoc = memoryStorage[trackingId];
  if (!savedDoc) {
    return res.status(404).send("Document not found or expired.");
  }

  let textToSend = "";
  let filename = "";

  try {
    if (docType === 'coverletter') {
      const cl = savedDoc.coverLetter || {};
      const bodyParagraphs = Array.isArray(cl.bodyParagraphs) ? cl.bodyParagraphs : [];
      
      textToSend = `${cl.senderName || ''}\n${cl.senderContact || ''}\n\nTo:\n${cl.recipientCompany || ''}\n\nSubject: ${cl.subjectLine || ''}\n\n${cl.salutation || ''}\n\n${bodyParagraphs.join('\n\n')}\n\n${cl.signOff || ''}\n${cl.senderName || ''}`;
      filename = 'Anschreiben.txt';
    } else {
      const cv = savedDoc.tailoredCV || {};
      const tailoredExperience = Array.isArray(cv.tailoredExperience) ? cv.tailoredExperience : [];
      const atsKeywordsMatched = Array.isArray(cv.atsKeywordsMatched) ? cv.atsKeywordsMatched : [];

      const experienceText = tailoredExperience.map(exp => {
        const achievements = Array.isArray(exp.achievements) ? exp.achievements : [];
        return `${exp.role || 'Role'} at ${exp.company || 'Company'} (${exp.duration || ''})\n${achievements.map(a => `- ${a}`).join('\n')}`;
      }).join('\n\n');
      
      textToSend = `${cv.fullName || ''}\n${cv.professionalTitle || ''}\n\nSummary:\n${cv.summary || ''}\n\nExperience:\n${experienceText}\n\nKeywords Matched: ${atsKeywordsMatched.join(', ')}`;
      filename = 'Tailored_CV.txt';
    }

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(textToSend);

  } catch (innerError) {
    console.error("Critical extraction failure during text file compiling:", innerError);
    res.status(500).send("Error compiling text download file layout.");
  }
});

// ==========================================
// 4. DOWNLOAD PREMIUM PDF ENDPOINT (DIN 5008 Compliant)
// ==========================================
router.get('/download/pdf/:docType/:trackingId', async (req, res) => {
  try {
    const { docType, trackingId } = req.params;
    console.log(`📥 Premium PDF print compilation triggered for Type: ${docType}, ID: ${trackingId}`);
    
    const activeAsset = memoryStorage[trackingId]; 
    if (!activeAsset) {
      return res.status(404).json({ error: 'Requested asset transaction not found or expired.' });
    }

    if (docType !== 'coverletter') {
      return res.status(400).json({ error: 'Unsupported document compilation type.' });
    }

    const cl = activeAsset.coverLetter;
    const paragraphs = Array.isArray(cl.bodyParagraphs) ? cl.bodyParagraphs : [];
    
    // Build the paragraph string sequentially to ensure no async render-blocking
    let bodyParagraphsHTML = '';
    for (let i = 0; i < paragraphs.length; i++) {
      bodyParagraphsHTML += `<p style="text-align: justify; line-height: 1.6; margin-bottom: 16px; font-size: 14px; font-weight: 400; font-family: sans-serif; color: #334155;">${paragraphs[i]}</p>`;
    }

    const targetHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Anschreiben</title>
        <style>
          /* Define absolute A4 print constraints */
          @page { 
            size: A4; 
            margin: 20mm 20mm 20mm 25mm; /* DIN 5008 standard: 25mm left margin for folding/binding */
          }
          body { 
            background: white; 
            margin: 0; 
            padding: 0; 
            font-family: 'Times New Roman', Times, serif;
            -webkit-print-color-adjust: exact; 
          }
          p {
            text-align: justify;
            line-height: 1.6;
            margin-top: 0;
            margin-bottom: 16px;
            font-size: 14px;
            color: #1e293b;
          }
        </style>
      </head>
      <body>
        <div style="position: absolute; top: -20mm; left: -25mm; right: -20mm; height: 4px; background-color: #4f46e5;"></div>
        
        <div style="width: 100%; box-sizing: border-box; padding-top: 10mm;">
          
          <div style="border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; margin-bottom: 32px; font-family: sans-serif;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top;">
                  <h2 style="font-size: 18px; font-weight: 700; text-transform: uppercase; margin: 0; color: #0f172a; letter-spacing: -0.02em;">${cl.senderName || 'Your Name'}</h2>
                  <p style="font-size: 11px; color: #64748b; margin: 4px 0 0 0; font-family: sans-serif;">${cl.senderContact || ''}</p>
                </td>
                <td style="text-align: right; font-size: 9px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.1em; vertical-align: top; padding-top: 6px;">
                  DIN 5008 Layout
                </td>
              </tr>
            </table>
          </div>

          <div style="margin-bottom: 35mm; font-family: sans-serif; font-size: 12px; color: #334155;">
            <span style="font-size: 9px; font-weight: 700; color: #6366f1; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.05em;">Empfänger</span>
            <div style="font-weight: 500; color: #0f172a; background-color: #f8fafc; border-left: 3px solid #cbd5e1; padding: 12px; font-style: italic; width: 85mm;">
              ${cl.recipientCompany || 'Target Company Name'}
            </div>
          </div>

          <div style="margin-bottom: 24px;">
            <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; font-family: sans-serif; margin: 0; letter-spacing: -0.01em;">
              ${cl.subjectLine || 'Bewerbung'}
            </h3>
          </div>

          <div style="margin-top: 16px;">
            <p style="font-family: sans-serif; font-weight: 700; color: #0f172a; margin-bottom: 16px;">${cl.salutation || 'Sehr geehrte Damen und Herren,'}</p>
            <div>${bodyParagraphsHTML}</div>
            
            <div style="margin-top: 40px; font-family: sans-serif;">
              <p style="font-size: 14px; color: #1e293b; margin: 0;">Mit freundlichen Grüßen</p>
              <div style="margin-top: 48px;">
                <p style="font-size: 14px; font-weight: 700; color: #0f172a; border-top: 1px solid #cbd5e1; padding-top: 6px; display: inline-block; min-width: 160px;">${cl.senderName || ''}</p>
              </div>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;
    
    // Generate buffer from our clean service
    const pdfBuffer = await pdfService.generateA4Buffer(targetHtml);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF content resulted in an empty payload.');
    }

    // Force strict binary stream headers response
    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Anschreiben_${trackingId}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    return res.end(pdfBuffer);

  } catch (err) {
    console.error('Routing execution download loop failure:', err);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal pipeline asset compilation failure.' });
    }
  }
});

export default router;