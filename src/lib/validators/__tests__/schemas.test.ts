import { describe, it, expect } from 'vitest';
import {
  cvTextSchema,
  jobDescriptionSchema,
  fileUploadSchema,
  manualEntrySchema,
  languageSchema,
  aiResponseSchema,
  generateRequestSchema,
  orderIdSchema,
  downloadRequestSchema,
} from '../schemas';

describe('cvTextSchema', () => {
  it('accepts valid CV text', () => {
    const result = cvTextSchema.safeParse('This is a valid CV text with enough characters');
    expect(result.success).toBe(true);
  });

  it('rejects text shorter than 10 chars', () => {
    const result = cvTextSchema.safeParse('Short');
    expect(result.success).toBe(false);
  });

  it('rejects text longer than 5000 chars', () => {
    const result = cvTextSchema.safeParse('a'.repeat(5001));
    expect(result.success).toBe(false);
  });

  it('accepts text at exactly 5000 chars', () => {
    const result = cvTextSchema.safeParse('a'.repeat(5000));
    expect(result.success).toBe(true);
  });
});

describe('jobDescriptionSchema', () => {
  it('accepts valid job description', () => {
    const result = jobDescriptionSchema.safeParse('We are looking for a senior developer with React experience and team leadership skills');
    expect(result.success).toBe(true);
  });

  it('rejects text shorter than 20 chars', () => {
    const result = jobDescriptionSchema.safeParse('Short job desc');
    expect(result.success).toBe(false);
  });

  it('rejects text longer than 3000 chars', () => {
    const result = jobDescriptionSchema.safeParse('a'.repeat(3001));
    expect(result.success).toBe(false);
  });
});

describe('fileUploadSchema', () => {
  it('accepts valid PDF file', () => {
    const result = fileUploadSchema.safeParse({
      name: 'resume.pdf',
      size: 1024,
      type: 'application/pdf',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid DOCX file', () => {
    const result = fileUploadSchema.safeParse({
      name: 'resume.docx',
      size: 2048,
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    expect(result.success).toBe(true);
  });

  it('accepts valid TXT file', () => {
    const result = fileUploadSchema.safeParse({
      name: 'resume.txt',
      size: 512,
      type: 'text/plain',
    });
    expect(result.success).toBe(true);
  });

  it('rejects unsupported file type', () => {
    const result = fileUploadSchema.safeParse({
      name: 'resume.exe',
      size: 1024,
      type: 'application/octet-stream',
    });
    expect(result.success).toBe(false);
  });

  it('rejects file larger than 5MB', () => {
    const result = fileUploadSchema.safeParse({
      name: 'resume.pdf',
      size: 6 * 1024 * 1024,
      type: 'application/pdf',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty file', () => {
    const result = fileUploadSchema.safeParse({
      name: 'empty.pdf',
      size: 0,
      type: 'application/pdf',
    });
    expect(result.success).toBe(false);
  });
});

describe('manualEntrySchema', () => {
  it('accepts valid manual entry with name and skills', () => {
    const result = manualEntrySchema.safeParse({
      name: 'Max Mustermann',
      skills: 'React, TypeScript, Node.js',
    });
    expect(result.success).toBe(true);
  });

  it('rejects entry without name', () => {
    const result = manualEntrySchema.safeParse({
      skills: 'React, TypeScript',
    });
    expect(result.success).toBe(false);
  });
});

describe('aiResponseSchema', () => {
  it('accepts valid AI response', () => {
    const result = aiResponseSchema.safeParse({
      coverLetter: 'Sehr geehrte Damen und Herren, ich bewerbe mich hiermit um die Stelle als Entwickler bei Ihrem Unternehmen.',
      cvKeywords: 'Frontend-Entwicklung, React, TypeScript, Teamführung',
      atsSuggestions: '1. Fügen Sie Keywords hinzu: Scrum, Agile, CI/CD',
      generatedCv: 'PERSÖNLICHE DATEN\nName: Max Mustermann\nBerufserfahrung: 5 Jahre',
    });
    expect(result.success).toBe(true);
  });

  it('rejects response with empty cover letter', () => {
    const result = aiResponseSchema.safeParse({
      coverLetter: '',
      cvKeywords: 'keywords',
      atsSuggestions: 'suggestions',
      generatedCv: 'cv content',
    });
    expect(result.success).toBe(false);
  });
});

describe('generateRequestSchema', () => {
  it('accepts valid generate request', () => {
    const result = generateRequestSchema.safeParse({
      cvText: 'This is my CV with relevant experience and skills',
      jobDescription: 'We are looking for a developer with React and Node.js experience to join our team',
      inputLanguage: 'English',
    });
    expect(result.success).toBe(true);
  });
});

describe('orderIdSchema', () => {
  it('accepts valid order ID', () => {
    const result = orderIdSchema.safeParse('MOCK-1234567890-abc123');
    expect(result.success).toBe(true);
  });

  it('rejects empty order ID', () => {
    const result = orderIdSchema.safeParse('');
    expect(result.success).toBe(false);
  });
});
