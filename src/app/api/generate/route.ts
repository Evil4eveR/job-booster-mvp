/**
 * POST /api/generate
 *
 * Main AI generation endpoint with rate limiting, Zod validation, timeout, and caching.
 * Uses the aiGeneration service for all business logic.
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateDocuments, validateGenerateRequest } from '@/lib/services/aiGeneration.service';
import { generateRateLimiter } from '@/lib/validators/rateLimiter';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';
    const rateLimit = generateRateLimiter.check(ip);
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

    const body = await request.json();

    // Extract fields
    const { cvText, jobDescription, inputLanguage } = body;
    const manualInfo = {
      name: body.name,
      email: body.email,
      address: body.address,
      github: body.github,
      linkedIn: body.linkedIn,
      skills: body.skills,
      experience: body.experience,
      education: body.education,
    };

    // Validate with Zod through service
    const validation = validateGenerateRequest({
      cvText,
      jobDescription,
      inputLanguage,
      ...manualInfo,
    });
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    // Generate documents with timeout and caching via service
    const result = await generateDocuments({
      cvText,
      jobDescription,
      inputLanguage: inputLanguage || 'English',
      ...manualInfo,
      timeout: 30000,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 500 }
      );
    }

    // Store in DB asynchronously (non-blocking)
    storeApplication({
      id: result.data.id,
      cvText: cvText.substring(0, 5000),
      jobDescription: jobDescription.substring(0, 5000),
      inputLanguage: inputLanguage || 'English',
      coverLetter: result.data.coverLetter,
      cvKeywords: result.data.cvKeywords,
      atsSuggestions: result.data.atsSuggestions,
      generatedCv: result.data.generatedCv,
    }).catch(err => {
      logger.error('DB store failed', 'GenerateAPI', { error: err.message });
    });

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    logger.error('Generate API error', 'GenerateAPI', {
      error: error instanceof Error ? error.message : 'Unknown',
    });
    const message = error instanceof Error ? error.message : 'Failed to generate application documents';
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}

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
        cvText: data.cvText,
        jobDescription: data.jobDescription,
        inputLanguage: data.inputLanguage,
        coverLetter: data.coverLetter,
        cvKeywords: data.cvKeywords,
        atsSuggestions: data.atsSuggestions,
        generatedCv: data.generatedCv,
        paymentStatus: 'paid',
      }
    });
  } catch (err) {
    logger.error('DB store failed', 'GenerateAPI', {
      error: err instanceof Error ? err.message : 'Unknown',
    });
  }
}
