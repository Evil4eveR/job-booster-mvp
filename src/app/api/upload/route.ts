/**
 * POST /api/upload
 * 
 * Handles file upload and text extraction from PDF, DOCX, and TXT files.
 * Returns extracted text for further processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromFile, sanitizeText, validateFile } from '@/lib/file-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file before processing
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Extract text from the file
    const rawText = await extractTextFromFile(file);
    const sanitizedText = sanitizeText(rawText);

    if (!sanitizedText || sanitizedText.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Could not extract meaningful text from the file. Please ensure the file contains readable text.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        text: sanitizedText,
        fileName: file.name,
        fileSize: file.size,
        charCount: sanitizedText.length,
      }
    });
  } catch (error) {
    console.error('[Upload API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to process file';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
