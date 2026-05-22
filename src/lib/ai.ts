/**
 * AI Service - Handles all AI generation using z-ai-web-dev-sdk
 *
 * This module provides functions for:
 * - Generating German cover letters with structured JSON output
 * - Creating tailored CV keyword optimization
 * - Generating ATS optimization suggestions
 * - Optional CV content generation from basic info
 * - Auto-detecting CV language
 *
 * Phase 4 Update: Now uses structured JSON parsing instead of fragile regex.
 * Falls back to legacy regex parsing if structured parsing fails.
 */

import ZAI from 'z-ai-web-dev-sdk';
import {
  buildStructuredPrompt,
  parseStructuredAIResponse,
  retryStructuredParse,
  AIParseError,
} from '@/lib/ai/structuredParser';
import type { AiResponseInput } from '@/lib/validators/schemas';

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
 * Generate a complete application bundle using structured JSON output.
 * Primary parsing is JSON-based; falls back to legacy regex if JSON fails.
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
}): Promise<AiResponseInput> {
  const zai = await getZAI();

  const hasManualInfo = !!(params.userName || params.userSkills || params.userExperience);

  // Build manual info section if provided
  const manualInfoSection = hasManualInfo
    ? [
        '- Name: ' + (params.userName || 'Not provided'),
        '- Email: ' + (params.userEmail || 'Not provided'),
        '- Address: ' + (params.userAddress || 'Not provided'),
        '- GitHub: ' + (params.userGithub || 'Not provided'),
        '- LinkedIn: ' + (params.userLinkedIn || 'Not provided'),
        '- Skills: ' + (params.userSkills || 'Not provided'),
        '- Experience: ' + (params.userExperience || 'Not provided'),
        '- Education: ' + (params.userEducation || 'Not provided'),
      ].join('\n')
    : '';

  // Use structured prompt for JSON output
  const structuredPrompt = buildStructuredPrompt({
    cvText: params.cvText,
    jobDescription: params.jobDescription,
    inputLanguage: params.inputLanguage,
    hasManualInfo,
    manualInfoSection,
  });

  try {
    // Try structured JSON parsing first with retry logic
    const result = await retryStructuredParse(async () => {
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'assistant',
            content: 'You are an expert German career consultant and ATS optimization specialist. You MUST respond with valid JSON only. No markdown, no code blocks, no additional text.'
          },
          {
            role: 'user',
            content: structuredPrompt
          }
        ],
        thinking: { type: 'disabled' }
      });

      return completion.choices[0]?.message?.content || '';
    }, 2);

    return result;
  } catch (structuredError) {
    // Structured parsing failed — fall back to legacy regex approach
    console.warn('[AI Service] Structured parsing failed, falling back to legacy regex:', 
      structuredError instanceof AIParseError ? structuredError.message : 'Unknown error');

    const legacyPrompt = buildLegacyPrompt(params, hasManualInfo, manualInfoSection);

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'assistant',
          content: 'You are an expert German career consultant and ATS optimization specialist. You produce professional, realistic, and immediately usable application documents. You always respond with structured content using the exact headers provided.'
        },
        {
          role: 'user',
          content: legacyPrompt
        }
      ],
      thinking: { type: 'disabled' }
    });

    const response = completion.choices[0]?.message?.content || '';
    return parseLegacyResponse(response);
  }
}

/**
 * Build the legacy prompt with === SECTION === delimiters
 * Used as a fallback when structured JSON parsing fails
 */
function buildLegacyPrompt(params: {
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
}, hasManualInfo: boolean, manualInfoSection: string): string {
  return `You are an expert ATS recruitment optimizer and professional German corporate copywriter. The user's original CV is written in ${params.inputLanguage}.

Analyze the following CV and the target German job description to generate a complete application bundle.

${manualInfoSection ? '\nADDITIONAL USER INFORMATION (provided manually):\n' + manualInfoSection + '\n' : ''}

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
}

/**
 * Legacy regex-based response parser.
 * Kept as fallback for AI models that don't return clean JSON.
 */
function parseLegacyResponse(response: string): AiResponseInput {
  const coverLetterMatch = response.match(/===\s*ANSCHREIBEN[^=]*===\s*\n([\s\S]*?)(?====|$)/i);
  const cvKeywordsMatch = response.match(/===\s*LEBENSLAUFLISTE[^=]*===\s*\n([\s\S]*?)(?====|$)/i);
  const atsMatch = response.match(/===\s*ATS-OPTIMIERUNG[^=]*===\s*\n([\s\S]*?)(?====|$)/i);
  const generatedCvMatch = response.match(/===\s*LEBENSLAUF-ENTWURF[^=]*===\s*\n([\s\S]*?)(?====|$)/i);

  const result: AiResponseInput = {
    coverLetter: coverLetterMatch?.[1]?.trim() || response,
    cvKeywords: cvKeywordsMatch?.[1]?.trim() || '',
    atsSuggestions: atsMatch?.[1]?.trim() || '',
    generatedCv: generatedCvMatch?.[1]?.trim() || '',
  };

  // If parsing failed, try alternative header patterns
  if (!result.cvKeywords && !result.atsSuggestions) {
    const parts = response.split(/\n(?=#{1,3}\s|\d+\.\s)/);
    if (parts.length >= 4) {
      result.coverLetter = parts[0]?.trim() || '';
      result.cvKeywords = parts[1]?.trim() || '';
      result.atsSuggestions = parts[2]?.trim() || '';
      result.generatedCv = parts.slice(3).join('\n').trim();
    }
  }

  return result;
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
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt - 1)));
      }
    }
  }

  throw new Error(`AI generation failed after ${maxRetries} attempts: ${lastError?.message}`);
}
