/**
 * POST /api/download
 * 
 * Downloads generated application documents as TXT.
 * Content is provided in the request body (no database dependency).
 * PDF generation is handled client-side using browser print-to-PDF.
 */

import { NextRequest, NextResponse } from 'next/server';

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

    // Build the full document content
    const fullContent = buildDocumentContent(content);

    // Return as plain text file
    return new NextResponse(fullContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `attachment; filename="bewerbung-bundle.txt"`,
      },
    });
  } catch (error) {
    console.error('[Download API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate download';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * Build the full document content from application data
 */
function buildDocumentContent(app: {
  coverLetter?: string | null;
  cvKeywords?: string | null;
  atsSuggestions?: string | null;
  generatedCv?: string | null;
}): string {
  const sections: string[] = [];

  sections.push('═══════════════════════════════════════════════════');
  sections.push('  BEWERBUNGGENIE - German Application Bundle');
  sections.push('═══════════════════════════════════════════════════');
  sections.push('');

  if (app.coverLetter) {
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('  ANSCHREIBEN (GERMAN COVER LETTER)');
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('');
    sections.push(app.coverLetter);
    sections.push('');
  }

  if (app.cvKeywords) {
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('  LEBENSLAUFLISTE (CV KEYWORD OPTIMIZATION)');
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('');
    sections.push(app.cvKeywords);
    sections.push('');
  }

  if (app.atsSuggestions) {
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('  ATS-OPTIMIERUNG (ATS OPTIMIZATION SUGGESTIONS)');
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('');
    sections.push(app.atsSuggestions);
    sections.push('');
  }

  if (app.generatedCv) {
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('  LEBENSLAUF-ENTWURF (GENERATED CV DRAFT)');
    sections.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    sections.push('');
    sections.push(app.generatedCv);
    sections.push('');
  }

  return sections.join('\n');
}
