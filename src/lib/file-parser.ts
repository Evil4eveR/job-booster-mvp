/**
 * File Parser - Extracts text from uploaded files
 * 
 * Supports:
 * - PDF files (using pdfjs-dist / Mozilla PDF.js)
 * - DOCX files (using mammoth)
 * - TXT files (plain text reading)
 * 
 * Includes file validation and size limits
 */

import mammoth from 'mammoth';

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Allowed MIME types
const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];

// Allowed file extensions
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

/**
 * Dynamically load pdfjs-dist only when needed
 * This avoids importing heavy PDF.js module on server startup
 */
async function getPdfLib() {
  const pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  return pdfjsLib;
}

/**
 * Validate an uploaded file
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check if file exists
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return { valid: false, error: `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB` };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  // Check file extension
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  if (!hasValidExtension) {
    return { valid: false, error: `Unsupported file type. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}` };
  }

  // Check MIME type (if available)
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type) && file.type !== 'application/octet-stream') {
    return { valid: false, error: `Unsupported file type: ${file.type}` };
  }

  return { valid: true };
}

/**
 * Extract text from an uploaded file based on its type
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const validation = validateFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return extractFromPDF(file);
  } else if (fileName.endsWith('.docx')) {
    return extractFromDOCX(file);
  } else if (fileName.endsWith('.txt')) {
    return extractFromTXT(file);
  }

  throw new Error('Unsupported file type');
}

/**
 * Extract text from a PDF file using Mozilla PDF.js (lazy loaded)
 */
async function extractFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await getPdfLib();
    const arrayBuffer = await file.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    // Load the PDF document using pdfjs-dist
    const pdf = await pdfjsLib.getDocument({ data, useSystemFonts: true }).promise;

    const textParts: string[] = [];
    const numPages = pdf.numPages;

    // Extract text from each page
    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      textParts.push(pageText);
    }

    const fullText = textParts.join('\n\n').trim();

    if (!fullText || fullText.length === 0) {
      throw new Error('Could not extract text from PDF. The file may be image-based or corrupted.');
    }

    return fullText;
  } catch (error) {
    if (error instanceof Error && error.message.includes('Could not extract')) {
      throw error;
    }
    throw new Error('Failed to parse PDF file. Please ensure it is a valid, text-based PDF.');
  }
}

/**
 * Extract text from a DOCX file
 */
async function extractFromDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const result = await mammoth.extractRawText({ buffer });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error('Could not extract text from DOCX. The file may be empty or corrupted.');
    }

    return result.value.trim();
  } catch (error) {
    if (error instanceof Error && error.message.includes('Could not extract')) {
      throw error;
    }
    throw new Error('Failed to parse DOCX file. Please ensure it is a valid Word document.');
  }
}

/**
 * Extract text from a TXT file
 */
async function extractFromTXT(file: File): Promise<string> {
  try {
    const text = await file.text();
    if (!text || text.trim().length === 0) {
      throw new Error('The text file is empty.');
    }
    return text.trim();
  } catch (error) {
    if (error instanceof Error && error.message.includes('empty')) {
      throw error;
    }
    throw new Error('Failed to read text file.');
  }
}

/**
 * Sanitize extracted text for safe processing
 * Removes potentially harmful characters while preserving content
 */
export function sanitizeText(text: string): string {
  return text
    // Remove null bytes
    .replace(/\0/g, '')
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    // Normalize whitespace (preserve intentional line breaks)
    .replace(/[ \t]+/g, ' ')
    // Trim leading/trailing whitespace
    .trim()
    // Limit total length to prevent abuse (max 50000 chars)
    .substring(0, 50000);
}

/**
 * Validate job description input
 */
export function validateJobDescription(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: 'Job description is required' };
  }
  if (text.trim().length < 20) {
    return { valid: false, error: 'Job description is too short. Please provide more details.' };
  }
  if (text.length > 30000) {
    return { valid: false, error: 'Job description is too long. Please shorten it.' };
  }
  return { valid: true };
}

/**
 * Validate manual user info entry
 */
export function validateManualEntry(data: {
  name?: string;
  email?: string;
  skills?: string;
  experience?: string;
  education?: string;
}): { valid: boolean; error?: string } {
  // At minimum, we need name + skills or experience
  if (!data.name?.trim()) {
    return { valid: false, error: 'Name is required for manual entry' };
  }
  if (!data.skills?.trim() && !data.experience?.trim()) {
    return { valid: false, error: 'Please provide at least your skills or experience' };
  }
  // Validate email format if provided
  if (data.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }
  return { valid: true };
}
