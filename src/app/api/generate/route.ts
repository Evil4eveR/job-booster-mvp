/**
 * POST /api/generate
 * 
 * Main AI generation endpoint.
 * Generates: German cover letter, CV keywords, ATS suggestions, optional CV draft.
 * 
 * This endpoint generates content and stores it in the database for later retrieval.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateApplicationBundle, retryAI } from '@/lib/ai';
import { sanitizeText, validateJobDescription, validateManualEntry } from '@/lib/file-parser';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Extract and validate required fields
    const { cvText, jobDescription, inputLanguage } = body;
    const manualInfo = {
      name: body.name,
      email: body.email,
      address: body.address,
      github: body.github,
      linkedin: body.linkedIn,
      skills: body.skills,
      experience: body.experience,
      education: body.education,
    };

    // Validate CV text
    if (!cvText || typeof cvText !== 'string' || cvText.trim().length < 10) {
      return NextResponse.json(
        { success: false, error: 'CV text is required and must be at least 10 characters' },
        { status: 400 }
      );
    }

    // Validate job description
    const jdValidation = validateJobDescription(jobDescription);
    if (!jdValidation.valid) {
      return NextResponse.json(
        { success: false, error: jdValidation.error },
        { status: 400 }
      );
    }

    // Validate manual entry if provided
    const hasManualInfo = Object.values(manualInfo).some(v => v?.trim());
    if (hasManualInfo) {
      const manualValidation = validateManualEntry(manualInfo);
      if (!manualValidation.valid) {
        return NextResponse.json(
          { success: false, error: manualValidation.error },
          { status: 400 }
        );
      }
    }

    // Sanitize inputs
    const sanitizedCvText = sanitizeText(cvText);
    const sanitizedJobDescription = sanitizeText(jobDescription);
    const sanitizedLanguage = (inputLanguage || 'English').substring(0, 50);

    // Generate the application bundle with retry logic
    const result = await retryAI(async () => {
      return generateApplicationBundle({
        cvText: sanitizedCvText,
        jobDescription: sanitizedJobDescription,
        inputLanguage: sanitizedLanguage,
        ...Object.fromEntries(
          Object.entries(manualInfo).map(([k, v]) => [k, v ? sanitizeText(v as string) : undefined])
        )
      });
    });

    // Generate a unique ID for this application
    const appId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    // Store in database asynchronously (don't block the response)
    storeApplication({
      id: appId,
      cvText: sanitizedCvText,
      jobDescription: sanitizedJobDescription,
      inputLanguage: sanitizedLanguage,
      coverLetter: result.coverLetter,
      cvKeywords: result.cvKeywords,
      atsSuggestions: result.atsSuggestions,
      generatedCv: result.generatedCv,
    }).catch(err => {
      console.error('[DB Store Error]:', err.message);
    });

    return NextResponse.json({
      success: true,
      data: {
        id: appId,
        coverLetter: result.coverLetter,
        cvKeywords: result.cvKeywords,
        atsSuggestions: result.atsSuggestions,
        generatedCv: result.generatedCv,
      }
    });
  } catch (error) {
    console.error('[Generate API Error]:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate application documents';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

/**
 * Store the application data in the database (non-blocking)
 */
async function storeApplication(data: {
  id: string;
  cvText: string;
  jobDescription: string;
  inputLanguage: string;
  coverLetter: string;
  cvKeywords: string;
  atsSuggestions: string;
  generatedCv: string;
}) {
  try {
    const { db } = await import('@/lib/db');
    await db.application.create({
      data: {
        id: data.id,
        cvText: data.cvText.substring(0, 5000),
        jobDescription: data.jobDescription.substring(0, 5000),
        inputLanguage: data.inputLanguage,
        coverLetter: data.coverLetter,
        cvKeywords: data.cvKeywords,
        atsSuggestions: data.atsSuggestions,
        generatedCv: data.generatedCv,
        paymentStatus: 'paid',
      }
    });
  } catch (err) {
    // Non-critical - the content is already returned to the user
    console.error('[DB Store Failed]:', err);
  }
}
