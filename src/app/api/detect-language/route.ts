/**
 * POST /api/detect-language
 * 
 * Auto-detects the language of provided text using AI.
 * Returns the detected language name.
 */

import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string' || text.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'Text must be at least 10 characters for language detection' },
        { status: 400 }
      );
    }

    // Limit text length for language detection
    const truncatedText = text.substring(0, 3000);
    const language = await detectLanguage(truncatedText);

    return NextResponse.json({
      success: true,
      data: { language }
    });
  } catch (error) {
    console.error('[Language Detection API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to detect language';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
