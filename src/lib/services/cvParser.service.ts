/**
 * CV Parser Service - Pure business logic for parsing CV files.
 * No React dependencies. All functions are pure and testable.
 */

import { validateFile, extractTextFromFile, sanitizeText, validateJobDescription, validateManualEntry } from '@/lib/file-parser';
import { cvTextSchema, jobDescriptionSchema, fileUploadSchema, manualEntrySchema } from '@/lib/validators/schemas';
import { logger } from '@/lib/logger';

export interface ParsedCVResult {
  success: boolean;
  text?: string;
  charCount?: number;
  error?: string;
}

/**
 * Parse an uploaded CV file with full validation.
 */
export async function parseCVFile(file: File): Promise<ParsedCVResult> {
  // Step 1: Basic file validation (from file-parser.ts)
  const validation = validateFile(file);
  if (!validation.valid) {
    logger.warn('File validation failed', 'CVParser', { error: validation.error });
    return { success: false, error: validation.error };
  }

  // Step 2: Zod schema validation
  const schemaResult = fileUploadSchema.safeParse({
    name: file.name,
    size: file.size,
    type: file.type,
  });

  if (!schemaResult.success) {
    const errorMsg = schemaResult.error.issues.map(i => i.message).join(', ');
    logger.warn('File schema validation failed', 'CVParser', { error: errorMsg });
    return { success: false, error: errorMsg };
  }

  // Step 3: Extract text
  try {
    const rawText = await extractTextFromFile(file);
    const sanitizedText = sanitizeText(rawText);

    if (!sanitizedText || sanitizedText.length < 10) {
      return {
        success: false,
        error: 'Could not extract meaningful text from the file. Please ensure the file contains readable text.',
      };
    }

    // Step 4: Validate extracted text length against CV schema
    const cvResult = cvTextSchema.safeParse(sanitizedText);
    if (!cvResult.success) {
      const errorMsg = cvResult.error.issues[0]?.message || 'CV text validation failed';
      logger.warn('CV text too long', 'CVParser', { length: sanitizedText.length });
      return { success: false, error: `Extracted text is too long (${sanitizedText.length} chars). Maximum is 5000 characters. Please shorten your CV or upload a more concise version.` };
    }

    logger.info('CV file parsed successfully', 'CVParser', {
      charCount: sanitizedText.length,
      fileName: file.name,
    });

    return {
      success: true,
      text: sanitizedText,
      charCount: sanitizedText.length,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to parse file';
    logger.error('CV file parsing error', 'CVParser', { error: message });
    return { success: false, error: message };
  }
}

/**
 * Validate a job description with Zod schema.
 */
export function validateJobDesc(text: string): { valid: boolean; error?: string } {
  // First use the existing validator
  const basicValidation = validateJobDescription(text);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Then validate with Zod
  const result = jobDescriptionSchema.safeParse(text);
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message || 'Invalid job description' };
  }

  return { valid: true };
}

/**
 * Validate manual entry data with Zod schema.
 */
export function validateManual(data: {
  name?: string;
  email?: string;
  skills?: string;
  experience?: string;
  education?: string;
}): { valid: boolean; error?: string } {
  const basicValidation = validateManualEntry(data);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  const result = manualEntrySchema.safeParse(data);
  if (!result.success) {
    return { valid: false, error: result.error.issues[0]?.message || 'Invalid manual entry' };
  }

  return { valid: true };
}
