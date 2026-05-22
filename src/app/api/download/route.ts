/**
 * POST /api/download
 *
 * Downloads generated application documents as TXT.
 * Uses the pdfExport service for formatting.
 * Validates with Zod schema before processing.
 */

import { NextRequest, NextResponse } from 'next/server';
import { buildTxtDocument } from '@/lib/services/pdfExport.service';
import { downloadRequestSchema } from '@/lib/validators/schemas';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, format = 'txt' } = body;

    if (!content) {
      return NextResponse.json(
        { success: false, error: 'Content is required' },
        { status: 400 }
      );
    }

    // Validate with Zod
    const validation = downloadRequestSchema.safeParse({ content, format });
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: validation.error.issues[0]?.message || 'Invalid request' },
        { status: 400 }
      );
    }

    const fullContent = buildTxtDocument(content);

    return new NextResponse(fullContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': 'attachment; filename="bewerbung-bundle.txt"',
      },
    });
  } catch (error) {
    logger.error('Download API error', 'DownloadAPI', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    const message = error instanceof Error ? error.message : 'Failed to generate download';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
