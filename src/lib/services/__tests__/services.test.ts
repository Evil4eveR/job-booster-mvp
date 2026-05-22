import { describe, it, expect, beforeEach } from 'vitest';
import { validateJobDesc, validateManual } from '../cvParser.service';
import { buildTxtDocument, buildPdfHtml } from '../pdfExport.service';
import { validateGenerateRequest, clearGenerationCache } from '../aiGeneration.service';

describe('validateJobDesc', () => {
  it('accepts valid job description', () => {
    expect(validateJobDesc('We are looking for a developer with React and Node.js experience to join our team').valid).toBe(true);
  });

  it('rejects short description', () => {
    expect(validateJobDesc('Short').valid).toBe(false);
  });

  it('rejects overly long description', () => {
    expect(validateJobDesc('a'.repeat(3001)).valid).toBe(false);
  });
});

describe('validateManual', () => {
  it('accepts name and skills', () => {
    expect(validateManual({ name: 'Max', skills: 'React' }).valid).toBe(true);
  });

  it('rejects without name', () => {
    expect(validateManual({ skills: 'React' }).valid).toBe(false);
  });
});

describe('validateGenerateRequest', () => {
  it('accepts valid request', () => {
    const result = validateGenerateRequest({
      cvText: 'This is a valid CV with enough text for validation',
      jobDescription: 'We are hiring a developer with React experience for our team',
      inputLanguage: 'English',
    });
    expect(result.valid).toBe(true);
  });

  it('rejects missing CV text', () => {
    const result = validateGenerateRequest({
      cvText: '',
      jobDescription: 'We are hiring',
      inputLanguage: 'English',
    });
    expect(result.valid).toBe(false);
  });
});

describe('buildTxtDocument', () => {
  it('builds formatted document with all sections', () => {
    const result = buildTxtDocument({
      coverLetter: 'Dear Sir/Madam',
      cvKeywords: 'React, TypeScript',
      atsSuggestions: 'Add keywords',
      generatedCv: 'Personal Data',
    });
    expect(result).toContain('ANSCHREIBEN');
    expect(result).toContain('LEBENSLAUFLISTE');
    expect(result).toContain('ATS-OPTIMIERUNG');
    expect(result).toContain('LEBENSLAUF-ENTWURF');
    expect(result).toContain('Dear Sir/Madam');
  });

  it('omits empty sections', () => {
    const result = buildTxtDocument({
      coverLetter: 'Dear Sir/Madam',
    });
    expect(result).toContain('ANSCHREIBEN');
    expect(result).not.toContain('LEBENSLAUFLISTE');
  });
});

describe('buildPdfHtml', () => {
  it('generates valid HTML with all sections', () => {
    const result = buildPdfHtml({
      coverLetter: 'Test letter',
      cvKeywords: 'Test keywords',
      atsSuggestions: 'Test suggestions',
      generatedCv: 'Test CV',
    });
    expect(result).toContain('<!DOCTYPE html>');
    expect(result).toContain('BewerbungGenie');
    expect(result).toContain('Test letter');
  });

  it('includes print styles', () => {
    const result = buildPdfHtml({
      coverLetter: 'Test',
      cvKeywords: 'Test',
      atsSuggestions: 'Test',
      generatedCv: 'Test',
    });
    expect(result).toContain('@media print');
    expect(result).toContain('A4');
  });
});
