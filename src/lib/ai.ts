/**
 * AI Service - Handles all AI generation using z-ai-web-dev-sdk
 * 
 * This module provides functions for:
 * - Generating German cover letters
 * - Creating tailored CV keyword optimization
 * - Generating ATS optimization suggestions
 * - Optional CV content generation from basic info
 * - Auto-detecting CV language
 */

import ZAI from 'z-ai-web-dev-sdk';

// Singleton pattern for ZAI instance to avoid repeated initialization
let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function getZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
  }
  return zaiInstance;
}

/**
 * Auto-detect the language of the provided CV text
 */
export async function detectLanguage(text: string): Promise<string> {
  const zai = await getZAI();

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are a language detection expert. Respond with ONLY the language name in English (e.g., "English", "German", "Arabic", "French", "Spanish", "Turkish", "Russian", "Chinese", "Japanese", "Portuguese", "Italian", "Dutch", "Polish", "Ukrainian"). No additional text.'
      },
      {
        role: 'user',
        content: `What language is this text written in?\n\n${text.substring(0, 2000)}`
      }
    ],
    thinking: { type: 'disabled' }
  });

  return completion.choices[0]?.message?.content?.trim() || 'English';
}

/**
 * Generate a complete application bundle:
 * - German cover letter (Anschreiben)
 * - Tailored CV keywords and phrases
 * - ATS optimization suggestions
 * - Optional generated CV draft
 */
export async function generateApplicationBundle(params: {
  cvText: string;
  jobDescription: string;
  inputLanguage: string;
  userName?: string;
  userEmail?: string;
  userAddress?: string;
  userGithub?: string;
  userLinkedIn?: string;
  userSkills?: string;
  userExperience?: string;
  userEducation?: string;
}): Promise<{
  coverLetter: string;
  cvKeywords: string;
  atsSuggestions: string;
  generatedCv: string;
}> {
  const zai = await getZAI();

  const hasManualInfo = params.userName || params.userSkills || params.userExperience;

  // Build manual info section if provided
  const manualInfoSection = hasManualInfo
    ? `
ADDITIONAL USER INFORMATION (provided manually):
- Name: ${params.userName || 'Not provided'}
- Email: ${params.userEmail || 'Not provided'}
- Address: ${params.userAddress || 'Not provided'}
- GitHub: ${params.userGithub || 'Not provided'}
- LinkedIn: ${params.userLinkedIn || 'Not provided'}
- Skills: ${params.userSkills || 'Not provided'}
- Experience: ${params.userExperience || 'Not provided'}
- Education: ${params.userEducation || 'Not provided'}
`
    : '';

  const prompt = `You are an expert ATS recruitment optimizer and professional German corporate copywriter. The user's original CV is written in ${params.inputLanguage}.

Analyze the following CV and the target German job description to generate a complete application bundle.

${manualInfoSection}

USER CV TEXT:
${params.cvText}

TARGET JOB DESCRIPTION:
${params.jobDescription}

Generate the following FOUR sections. Use the exact section headers marked with ===. Each section must be complete, professional, and ready to use.

=== ANSCHREIBEN (GERMAN COVER LETTER) ===
Write a formal, premium German cover letter tailored perfectly to this job profile. Requirements:
- Use standard German business letter format (Anschreiben format)
- Include formal greeting ("Sehr geehrte Damen und Herren" or specific if company known)
- 3-4 body paragraphs: introduction, relevant experience, motivation, closing
- Professional tone with sophisticated business German (keine umgangssprachlichen Ausdrücke)
- Reference specific qualifications from the CV that match the job description
- Close with "Mit freundlichen Grüßen" and placeholder for name
- Length: 250-350 words

=== LEBENSLAUFLISTE (CV KEYWORD OPTIMIZATION) ===
Translate and rewrite the user's primary professional experiences and technical skills into impactful German phrasing optimized for ATS systems and HR scanners. Requirements:
- Use standard German CV terminology and phrasing
- Include industry-standard German keywords from the job description
- Structure as bullet points grouped by category (Berufserfahrung, Technische Kompetenzen, Soft Skills, Sprachen)
- Each bullet point should start with a strong action verb in German
- Focus on measurable achievements where possible

=== ATS-OPTIMIERUNG (ATS OPTIMIZATION SUGGESTIONS) ===
Provide specific, actionable suggestions to improve the CV's ATS compatibility. Requirements:
- List 8-12 specific optimization suggestions
- Reference exact keywords from the job description that should be included
- Identify any missing qualifications that would strengthen the application
- Suggest formatting improvements for ATS parsing
- Rate the current CV-job match as a percentage
- Provide a list of critical missing keywords

=== LEBENSLAUF-ENTWURF (GENERATED CV DRAFT) ===
${hasManualInfo
    ? 'Generate a complete German CV draft using the provided manual information and the job description. Format as a structured German Lebenslauf with sections for: Persönliche Daten, Berufserfahrung, Ausbildung, Technische Kompetenzen, Sprachen, Interessen. Make it ATS-optimized and tailored to the job.'
    : 'Generate a German CV draft by adapting the original CV to German standards. Translate key sections, reformat to German Lebenslauf conventions, and optimize for the target position. Include: Persönliche Daten, Berufserfahrung, Ausbildung, Technische Kompetenzen, Sprachen.'}

Output Constraint: Return ONLY the four sections with their headers. Do not include conversational AI commentary or explanations outside the sections.`;

  const completion = await zai.chat.completions.create({
    messages: [
      {
        role: 'assistant',
        content: 'You are an expert German career consultant and ATS optimization specialist. You produce professional, realistic, and immediately usable application documents. You always respond with structured content using the exact headers provided.'
      },
      {
        role: 'user',
        content: prompt
      }
    ],
    thinking: { type: 'disabled' }
  });

  const response = completion.choices[0]?.message?.content || '';

  // Parse the response into structured sections
  return parseAIResponse(response);
}

/**
 * Parse the AI response into structured sections
 * Handles various formatting styles the AI might use
 */
function parseAIResponse(response: string): {
  coverLetter: string;
  cvKeywords: string;
  atsSuggestions: string;
  generatedCv: string;
} {
  // Try to split by the section headers
  const sections = {
    coverLetter: '',
    cvKeywords: '',
    atsSuggestions: '',
    generatedCv: ''
  };

  // Match sections using flexible pattern (handles === header === and similar)
  const coverLetterMatch = response.match(/===\s*ANSCHREIBEN[^=]*===\s*\n([\s\S]*?)(?====|$)/i);
  const cvKeywordsMatch = response.match(/===\s*LEBENSLAUFLISTE[^=]*===\s*\n([\s\S]*?)(?====|$)/i);
  const atsMatch = response.match(/===\s*ATS-OPTIMIERUNG[^=]*===\s*\n([\s\S]*?)(?====|$)/i);
  const generatedCvMatch = response.match(/===\s*LEBENSLAUF-ENTWURF[^=]*===\s*\n([\s\S]*?)(?====|$)/i);

  sections.coverLetter = coverLetterMatch?.[1]?.trim() || response;
  sections.cvKeywords = cvKeywordsMatch?.[1]?.trim() || '';
  sections.atsSuggestions = atsMatch?.[1]?.trim() || '';
  sections.generatedCv = generatedCvMatch?.[1]?.trim() || '';

  // If parsing failed, try alternative header patterns
  if (!sections.cvKeywords && !sections.atsSuggestions) {
    // Fallback: try splitting by numbered sections or common delimiters
    const parts = response.split(/\n(?=#{1,3}\s|\d+\.\s)/);
    if (parts.length >= 4) {
      sections.coverLetter = parts[0]?.trim() || '';
      sections.cvKeywords = parts[1]?.trim() || '';
      sections.atsSuggestions = parts[2]?.trim() || '';
      sections.generatedCv = parts.slice(3).join('\n').trim();
    } else {
      // Ultimate fallback: put everything in cover letter
      sections.coverLetter = response;
    }
  }

  return sections;
}

/**
 * Retry wrapper for AI calls with exponential backoff
 */
export async function retryAI<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn();
      if (!result) throw new Error('Empty response from AI');
      return result;
    } catch (error) {
      lastError = error as Error;
      console.error(`AI attempt ${attempt}/${maxRetries} failed:`, lastError.message);

      if (attempt < maxRetries) {
        // Exponential backoff: 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw new Error(`AI generation failed after ${maxRetries} attempts: ${lastError?.message}`);
}
