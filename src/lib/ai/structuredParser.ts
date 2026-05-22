/**
 * Structured AI Response Parser
 * 
 * Replaces fragile regex-based parsing with structured JSON output.
 * The AI is prompted to return valid JSON matching the aiResponseSchema,
 * which is then validated with Zod for type safety.
 */

import { z } from 'zod';
import { aiResponseSchema } from '@/lib/validators/schemas';
import type { AiResponseInput } from '@/lib/validators/schemas';

/** Maximum number of retry attempts for AI parsing */
const MAX_PARSE_RETRIES = 2;

/** Delay between retries in milliseconds (exponential backoff) */
const RETRY_BASE_DELAY = 1000;

/**
 * Error thrown when AI response cannot be parsed into valid structured data
 */
export class AIParseError extends Error {
  public readonly cause: Error | null;
  public readonly rawResponse: string;

  constructor(message: string, rawResponse: string, cause?: Error) {
    super(message);
    this.name = 'AIParseError';
    this.rawResponse = rawResponse;
    this.cause = cause ?? null;
  }
}

/**
 * Extract JSON from a string that may contain markdown code blocks
 * or other surrounding text.
 */
function extractJsonFromResponse(text: string): string | null {
  // Try direct JSON parse first
  const trimmed = text.trim();
  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    return trimmed;
  }

  // Try to extract from markdown code block
  const codeBlockMatch = text.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
  if (codeBlockMatch?.[1]) {
    return codeBlockMatch[1].trim();
  }

  // Try to find JSON object anywhere in the text
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return jsonMatch[0];
  }

  return null;
}

/**
 * Validate and parse a structured AI response.
 * Returns type-safe data or throws AIParseError.
 */
export function parseStructuredAIResponse(rawResponse: string): AiResponseInput {
  const jsonStr = extractJsonFromResponse(rawResponse);

  if (!jsonStr) {
    throw new AIParseError(
      'AI response does not contain valid JSON structure',
      rawResponse
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonStr);
  } catch (err) {
    throw new AIParseError(
      'Failed to parse AI response as JSON',
      rawResponse,
      err as Error
    );
  }

  // Validate with Zod schema
  const result = aiResponseSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    throw new AIParseError(
      `AI response validation failed: ${issues}`,
      rawResponse,
      result.error
    );
  }

  return result.data;
}

/**
 * Build a prompt that instructs the AI to return structured JSON.
 * This replaces the old === SECTION === delimiter approach.
 */
export function buildStructuredPrompt(params: {
  cvText: string;
  jobDescription: string;
  inputLanguage: string;
  hasManualInfo: boolean;
  manualInfoSection: string;
}): string {
  const jsonSchema = `{
  "coverLetter": "string (German cover letter, 250-350 words, formal business format)",
  "cvKeywords": "string (ATS-optimized German keyword phrases, bullet points by category)",
  "atsSuggestions": "string (8-12 specific optimization suggestions with match percentage)",
  "generatedCv": "string (Complete German Lebenslauf draft)"
}`;

  const manualSection = params.hasManualInfo
    ? `\nADDITIONAL USER INFORMATION (provided manually):\n${params.manualInfoSection}\n`
    : '';

  return `You are an expert ATS recruitment optimizer and professional German corporate copywriter. The user's original CV is written in ${params.inputLanguage}.

Analyze the following CV and the target German job description to generate a complete application bundle.
${manualSection}
USER CV TEXT:
${params.cvText}

TARGET JOB DESCRIPTION:
${params.jobDescription}

IMPORTANT: You MUST respond with ONLY a valid JSON object matching this exact schema:
${jsonSchema}

Requirements for each field:
- "coverLetter": Write a formal German cover letter (Anschreiben). Use standard German business letter format. Include formal greeting ("Sehr geehrte Damen und Herren" or specific if company known). 3-4 body paragraphs: introduction, relevant experience, motivation, closing. Professional tone with sophisticated business German. Reference specific qualifications from the CV that match the job description. Close with "Mit freundlichen Grüßen" and placeholder for name. Length: 250-350 words.
- "cvKeywords": Translate and rewrite the user's primary professional experiences and technical skills into impactful German phrasing optimized for ATS systems. Use bullet points grouped by category (Berufserfahrung, Technische Kompetenzen, Soft Skills, Sprachen). Each bullet starts with a strong action verb in German.
- "atsSuggestions": List 8-12 specific optimization suggestions. Reference exact keywords from the job description. Identify missing qualifications. Suggest formatting improvements. Rate current CV-job match as a percentage. Provide a list of critical missing keywords.
- "generatedCv": ${params.hasManualInfo ? 'Generate a complete German CV draft using the provided manual information.' : 'Generate a German CV draft by adapting the original CV to German standards.'} Include sections for: Persönliche Daten, Berufserfahrung, Ausbildung, Technische Kompetenzen, Sprachen. Make it ATS-optimized.

Output Constraint: Return ONLY the JSON object. No markdown, no code blocks, no additional text outside the JSON.`;
}

/**
 * Retry wrapper specifically for structured AI parsing.
 * Attempts parsing with exponential backoff.
 */
export async function retryStructuredParse(
  rawResponseGetter: () => Promise<string>,
  maxRetries: number = MAX_PARSE_RETRIES
): Promise<AiResponseInput> {
  let lastError: AIParseError | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const rawResponse = await rawResponseGetter();
      return parseStructuredAIResponse(rawResponse);
    } catch (error) {
      if (error instanceof AIParseError) {
        lastError = error;
      } else {
        lastError = new AIParseError(
          `Unexpected error during parsing: ${(error as Error).message}`,
          '',
          error as Error
        );
      }

      console.error(
        `[Structured Parse] Attempt ${attempt + 1}/${maxRetries + 1} failed:`,
        lastError.message
      );

      if (attempt < maxRetries) {
        const delay = RETRY_BASE_DELAY * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError ?? new AIParseError('Unknown parsing failure', '');
}
