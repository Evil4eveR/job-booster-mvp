/**
 * POST /api/upload
 *
 * Handles file upload with rate limiting, Zod validation, and CV length check.
 * Uses the cvParser service instead of direct file-parser calls.
 */

import { NextRequest, NextResponse } from 'next/server';
import { parseCVFile } from '@/lib/services/cvParser.service';
import { uploadRateLimiter } from '@/lib/validators/rateLimiter';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const rateLimit = uploadRateLimiter.check(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Rate limit exceeded. Please wait before trying again.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'Retry-After': Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Use the CV parser service (includes Zod validation + length check)
    const result = await parseCVFile(file);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        text: result.text,
        fileName: file.name,
        fileSize: file.size,
        charCount: result.charCount,
      }
    });
  } catch (error) {
    logger.error('Upload API error', 'UploadAPI', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    const message = error instanceof Error ? error.message : 'Failed to process file';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
