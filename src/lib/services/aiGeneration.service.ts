/**
 * AI Generation Service - Pure business logic for AI document generation.
 * No React dependencies. Includes timeout and caching.
 */

import { generateApplicationBundle, retryAI, detectLanguage } from '@/lib/ai';
import { generateRequestSchema } from '@/lib/validators/schemas';
import { logger } from '@/lib/logger';

export interface GenerateResult {
  success: boolean;
  data?: {
    id: string;
    coverLetter: string;
    cvKeywords: string;
    atsSuggestions: string;
    generatedCv: string;
  };
  error?: string;
}

/** Simple in-memory cache for repeated identical requests */
const generationCache = new Map<string, { result: GenerateResult; timestamp: number }>();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

/**
 * Create a cache key from CV text and job description.
 */
function createCacheKey(cvText: string, jobDescription: string, language: string): string {
  // Simple hash - use first 100 chars of each + length for uniqueness
  const cvHash = cvText.substring(0, 100) + '|' + cvText.length;
  const jdHash = jobDescription.substring(0, 100) + '|' + jobDescription.length;
  return `${cvHash}|${jdHash}|${language}`;
}

/**
 * Wrap a promise with a timeout.
 */
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`Operation timed out after ${ms / 1000} seconds`));
    }, ms);
    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((error) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

/**
 * Validate generation request parameters.
 */
export function validateGenerateRequest(params: {
  cvText: string;
  jobDescription: string;
  inputLanguage: string;
  [key: string]: unknown;
}): { valid: boolean; error?: string } {
  const result = generateRequestSchema.safeParse(params);
  if (!result.success) {
    const errorMsg = result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
    return { valid: false, error: errorMsg };
  }
  return { valid: true };
}

/**
 * Generate an application bundle with timeout and caching.
 */
export async function generateDocuments(params: {
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
  timeout?: number;
}): Promise<GenerateResult> {
  const timeout = params.timeout || 30000;

  // Check cache first
  const cacheKey = createCacheKey(params.cvText, params.jobDescription, params.inputLanguage);
  const cached = generationCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    logger.info('Returning cached generation result', 'AIGeneration');
    return cached.result;
  }

  try {
    logger.info('Starting AI generation', 'AIGeneration', {
      cvLength: params.cvText.length,
      jdLength: params.jobDescription.length,
      language: params.inputLanguage,
    });

    // Generate with timeout
    const result = await withTimeout(
      retryAI(async () => {
        return generateApplicationBundle(params);
      }, 2),
      timeout
    );

    const appId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const generateResult: GenerateResult = {
      success: true,
      data: {
        id: appId,
        coverLetter: result.coverLetter,
        cvKeywords: result.cvKeywords,
        atsSuggestions: result.atsSuggestions,
        generatedCv: result.generatedCv,
      },
    };

    // Cache the result
    generationCache.set(cacheKey, { result: generateResult, timestamp: Date.now() });

    logger.info('AI generation completed', 'AIGeneration', { appId });
    return generateResult;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate documents';
    logger.error('AI generation failed', 'AIGeneration', { error: message });

    if (message.includes('timed out')) {
      return {
        success: false,
        error: `Generation took too long (over ${timeout / 1000}s). Please try again.`,
      };
    }

    return { success: false, error: message };
  }
}

/**
 * Detect language with error handling.
 */
export async function detectCVLanguage(text: string): Promise<string> {
  try {
    const language = await detectLanguage(text);
    logger.info('Language detected', 'AIGeneration', { language });
    return language;
  } catch (error) {
    logger.warn('Language detection failed', 'AIGeneration', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    return 'English'; // Default fallback
  }
}

/**
 * Clear the generation cache (useful for testing).
 */
export function clearGenerationCache(): void {
  generationCache.clear();
}
