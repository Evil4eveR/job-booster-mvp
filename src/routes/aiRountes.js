import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';
import pdfService from '../services/pdfService.js';
import docxService from '../services/docxService.js';

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
You are an expert German application strategist and ATS optimization assistant specializing in European recruitment standards (DIN 5008).

TASK:
Analyze:
1. The uploaded user profile/resume.
2. The target job description.

Generate a highly optimized professional German cover letter and localized ATS keyword mapping profile based on the strict requirements below.

CRITICAL CONTENT AND GERMAN LANGUAGE RULES:
1. DO NOT include any introductory or generic cliché openings like "Mit großem Interesse habe ich Ihre Ausschreibung gelesen". Instead, write a strong, benefit-driven introduction tailored directly to the specific role requirements (e.g., mentioning target systems like ServiceNow, Linux, or ticket tools explicitly).
2. NEVER admit or mention low/beginner German language levels. COMPLETELY OMIT any sentence like "Obwohl meine Deutschkenntnisse derzeit auf Anfängerniveau sind...". If the role allows or requires English corporate operations, frame communication confidently (e.g., "Da die tägliche Arbeit teilweise auf Englisch stattfindet, bringe ich meine kommunikatative Stärke sofort ein, während ich meine Deutschkenntnisse aktiv ausbaue").
3. HARDCODE measurable key achievements and IT metrics inside the professional experience body paragraphs to satisfy strict recruiter expectations (e.g., "handling 35-50 tickets/day", "achieving an 82% to 85% first-resolution rate", or "strict SLA compliance").
4. INTEGRATE essential soft skills relevant to IT Support / Engineering naturally into the body text: structured troubleshooting, comprehensive team documentation, and clear customer-oriented communication.
5. ENSURE the final paragraph contains clear availability and legal working status statements exactly in this style: "Ich bin ab [Date/Sofort] verfügbar und besitze eine uneingeschränkte Arbeitserlaubnis für Deutschland."
6. THE FINAL SIGNOFF must end with a clean standard closing and a formal comma format: "Mit freundlichen Grüßen," on its own line followed immediately by the sender's full name.

STRICT FORMATTING AND CLEANLINESS RULES:
1. ABSOLUTELY FORBIDDEN: Do NOT include any markdown characters anywhere inside the string values (No hashes #, no asterisks *, no underscores _, no markdown bullet points). The text values must be completely clean raw text.
2. REMOVE all system label headers inside the text fields like "SENDER:", "EMPFÄNGER:", or "SUBJECT:". Just provide the raw content values directly.
3. DATA ENCODING: Output must be natively configured for perfect UTF-8 compatibility. Ensure German umlauts (ä, ö, ü, ß) render flawlessly as standard characters, not as escaped unicode sequences or broken symbols.

OUTPUT LANGUAGE:
${language}

STRICT OUTPUT RULES:
- Return ONLY valid raw JSON matching the required schema layout exactly.
- Do NOT wrap the JSON inside markdown code blocks (\`\`\`json ... \`\`\`). Return raw text string ready for JSON.parse().
- Do NOT include any intro or outro text snippets.
- Escape all nested double quotes inside the text values correctly with backslashes (\\").

REQUIRED JSON SCHEMA:
{
  "coverLetter": {
    "senderName": "string",
    "senderContact": "string (Full Address, Phone, Email formatted for top of letter)",
    "recipientCompany": "string (Full Company Address block matching formal recipient data)",
    "subjectLine": "string (Formal DIN 5008 line: e.g., 'Betreff: Bewerbung als Mitarbeiter im 2nd Level Support')",
    "salutation": "string (Formal greeting matching name if verified, otherwise 'Sehr geehrte Damen und Herren,')",
    "bodyParagraphs": [
      "string (Strong tailored introduction containing metric-driven hook)",
      "string (Core body focusing on technical stack alignment, SLAs, tickets, troubleshooting, and documentation achievements)",
      "string (Final paragraph declaring immediate/custom availability, and the unrestricted German work permit statement)"
    ],
    "signOff": "string (Exactly 'Mit freundlichen Grüßen,')"
  },
  "tailoredCV": {
    "fullName": "string",
    "professionalTitle": "string",
    "summary": "string (High-density ATS friendly tracking summary summary)",
    "tailoredExperience": [
      {
        "role": "string",
        "company": "string",
        "duration": "string",
        "achievements": [
          "string (Metric optimized support achievement)",
          "string (Technical deployment or systems engineering milestone)"
        ]
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
      config: {
        responseMimeType: "application/json" // يجبر الذكاء الاصطناعي على إرجاع JSON سليم 100% بدون أي Markdown أو أخطاء هروب
      }
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
// 3. DOWNLOAD PREMIUM DOCX ENDPOINT (New Word Export replacing old TXT)
// ==========================================
router.get('/download/docx/:docType/:trackingId', async (req, res) => {
  const { docType, trackingId } = req.params;
  console.log(`📥 Premium DOCX compilation triggered for Type: ${docType}, ID: ${trackingId}`);

  const savedDoc = memoryStorage[trackingId];
  if (!savedDoc) {
    return res.status(404).send("Document assets session expired or not found.");
  }

  try {
    let docxBuffer;
    let filename = "";

    if (docType === 'coverletter') {
      docxBuffer = await docxService.generateA4Buffer(savedDoc);
      filename = `Anschreiben_${trackingId}.docx`;
    } else {
      // Extended future capability fallback if they request tailored CV in word format
      return res.status(400).send("CV compilation in Word format is currently under maintenance. Use PDF.");
    }

    res.writeHead(200, {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': docxBuffer.length
    });

    return res.end(docxBuffer);

  } catch (innerError) {
    console.error("Critical extraction failure during DOCX file compiling:", innerError);
    res.status(500).send("Error compiling structured Microsoft Word download asset.");
  }
});

// ==========================================
// 4. DOWNLOAD PREMIUM PDF ENDPOINT (DIN 5008 Compliant - SAFE VERSION)
// ==========================================
router.get('/download/pdf/:docType/:trackingId', async (req, res) => {
  try {
    const { docType, trackingId } = req.params;
    console.log(`📥 Premium PDF print compilation triggered for Type: ${docType}, ID: ${trackingId}`);
    
    const activeAsset = memoryStorage[trackingId]; 
    if (!activeAsset) {
      console.error(`❌ Asset holding key [${trackingId}] was not found in server memory slots.`);
      return res.status(404).json({ error: 'Requested asset transaction not found or expired.' });
    }

    if (docType !== 'coverletter') {
      return res.status(400).json({ error: 'Unsupported document compilation type.' });
    }

    // تأمين جلب كائن رسالة التغطية حتى لو أرجعه الذكاء الاصطناعي فارغاً
    const cl = activeAsset.coverLetter || {};
    const paragraphs = Array.isArray(cl.bodyParagraphs) ? cl.bodyParagraphs : [];
    
    let bodyParagraphsHTML = '';
    if (paragraphs.length === 0) {
      // سطر أمان احتياطي في حال فشل استخراج الفقرات الأصلية من النموذج
      bodyParagraphsHTML = `<p style="text-align: justify; line-height: 1.6; margin-bottom: 20px; font-size: 13px; font-family: sans-serif; color: #1e293b;">Vielen Dank für die Prüfung meiner Bewerbungsunterlagen.</p>`;
    } else {
      for (let i = 0; i < paragraphs.length; i++) {
        bodyParagraphsHTML += `<p style="text-align: justify; line-height: 1.6; margin-bottom: 20px; font-size: 13px; font-weight: 400; font-family: sans-serif; color: #1e293b;">${paragraphs[i]}</p>`;
      }
    }

    const targetHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Anschreiben</title>
        <style>
          @page { 
            size: A4; 
            margin: 25mm 20mm 20mm 25mm;
          }
          body { 
            background: white; 
            margin: 0; 
            padding: 0; 
            font-family: Arial, Helvetica, sans-serif; 
            -webkit-print-color-adjust: exact; 
          }
        </style>
      </head>
      <body>
        <div style="width: 100%; box-sizing: border-box;">
          
          <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 30px;">
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="vertical-align: top;">
                  <h2 style="font-size: 20px; font-weight: 700; margin: 0; color: #0f172a; letter-spacing: -0.02em;">${cl.senderName || 'Yassin Marmoud'}</h2>
                  <p style="font-size: 11px; color: #475569; margin: 6px 0 0 0; line-height: 1.4;">${cl.senderContact || ''}</p>
                </td>
                <td style="text-align: right; font-size: 10px; font-weight: 600; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; vertical-align: top; padding-top: 6px;">
                  Bewerbungsunterlagen
                </td>
              </tr>
            </table>
          </div>

          <div style="text-align: right; font-size: 12px; color: #334155; margin-bottom: 20px;">
            ${new Date().toLocaleDateString('de-DE')}
          </div>

          <div style="margin-bottom: 25mm; font-size: 12px; color: #1e293b; line-height: 1.5; width: 85mm;">
            <div style="white-space: pre-line; color: #0f172a;">${cl.recipientCompany || ''}</div>
          </div>

          <div style="margin-bottom: 28px;">
            <h1 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">
              ${cl.subjectLine || 'Bewerbung'}
            </h1>
          </div>

          <div style="margin-top: 16px;">
            <p style="font-weight: 700; color: #0f172a; margin-bottom: 18px; font-size: 13px;">${cl.salutation || 'Sehr geehrte Damen und Herren,'}</p>
            <div>${bodyParagraphsHTML}</div>
            
            <div style="margin-top: 35px;">
              <p style="font-size: 13px; color: #1e293b; margin: 0;">${cl.signOff || 'Mit freundlichen Grüßen,'}</p>
              <div style="margin-top: 40px;">
                <p style="font-size: 13px; font-weight: 700; color: #0f172a; display: inline-block;">${cl.senderName || 'Yassin Marmoud'}</p>
              </div>
            </div>
          </div>

        </div>
      </body>
      </html>
    `;
    
    const pdfBuffer = await pdfService.generateA4Buffer(targetHtml);

    if (!pdfBuffer || pdfBuffer.length === 0) {
      throw new Error('PDF content resulted in an empty payload array execution error.');
    }

    res.writeHead(200, {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="Anschreiben_${trackingId}.pdf"`,
      'Content-Length': pdfBuffer.length
    });

    return res.end(pdfBuffer);

  } catch (err) {
    console.error('🔴 CRITICAL ROUTE CRASH DETECTED:', err); // 👈 هذا السطر سيطبع لك السبب التفصيلي في التيرمينال الآن إن وجد
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Internal pipeline asset compilation failure.' });
    }
  }
});

export default router;