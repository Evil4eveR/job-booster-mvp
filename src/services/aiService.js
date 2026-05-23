import { GoogleGenAI } from '@google/genai';
import { config } from '../config/environment.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

export const generateJobAssets = async (resumeText, jobDescription, inputLanguage) => {
  const targetModel = 'gemini-2.5-flash';
  
  const systemPrompt = `You are an elite executive career strategist, professional ATS optimization scanner, and expert copywriter specialized in the German job market.
Your task is to review the provided user profile/resume and the target German job description, and output a highly optimized suite of application assets.

You MUST strictly return your response as a valid, parsable JSON object matching this structure precisely, with no markdown code blocks formatting wrappers or trailing text:
{
  "detectedLanguage": "The language of the input resume text",
  "coverLetter": "A beautifully formatted, professional, compelling German cover letter (Anschreiben) tailored perfectly to the job criteria following standard German business style (DIN 5008 norms). Include placeholders for addresses and dates dynamically.",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "atsSuggestions": ["suggestion1", "suggestion2"],
  "optimizedCvDraft": "A professional, structured, comprehensive textual draft or clean text resume layout showing exactly how the user should structure their experience, skills, and summary to align directly with the target job profile."
}`;

  const userPrompt = `
  --- INPUT USER RESUME DATA ---
  ${resumeText}
  
  --- TARGET GERMAN JOB DESCRIPTION ---
  ${jobDescription}
  
  --- USER CONFIGURATION ---
  Preferred Input Language Selection: ${inputLanguage || 'Auto-Detect'}`;

  try {
    const response = await ai.models.generateContent({
      model: targetModel,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.3
      }
    });

    const responseText = response.text;
    return JSON.parse(responseText);
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('AI Generation service failed to construct tailored assets.');
  }
};