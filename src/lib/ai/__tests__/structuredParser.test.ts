import { describe, it, expect } from 'vitest';
import { parseStructuredAIResponse, AIParseError, buildStructuredPrompt } from '../structuredParser';

describe('parseStructuredAIResponse', () => {
  const validResponse = JSON.stringify({
    coverLetter: 'Sehr geehrte Damen und Herren, ich bewerbe mich hiermit um die ausgeschriebene Position. Mit über fünf Jahren Erfahrung in der Softwareentwicklung bringe ich die erforderlichen Qualifikationen mit. Ich freue mich auf ein persönliches Gespräch. Mit freundlichen Grüßen',
    cvKeywords: '• Frontend-Entwicklung mit React und TypeScript\n• Backend-Entwicklung mit Node.js\n• Teamführung und agile Methoden',
    atsSuggestions: '1. Match-Rate: 75%\n2. Fehlende Keywords: Scrum, CI/CD\n3. Empfehlung: Fügen Sie Agile-Methoden hinzu',
    generatedCv: 'PERSÖNLICHE DATEN\nName: Max Mustermann\nBerufserfahrung: Senior Developer',
  });

  it('parses valid JSON response', () => {
    const result = parseStructuredAIResponse(validResponse);
    expect(result.coverLetter).toContain('Sehr geehrte');
    expect(result.cvKeywords).toContain('Frontend');
    expect(result.atsSuggestions).toContain('Match-Rate');
    expect(result.generatedCv).toContain('PERSÖNLICHE DATEN');
  });

  it('parses JSON wrapped in markdown code block', () => {
    const wrapped = '```json\n' + validResponse + '\n```';
    const result = parseStructuredAIResponse(wrapped);
    expect(result.coverLetter).toBeDefined();
  });

  it('parses JSON with surrounding text', () => {
    const surrounded = 'Here is the response:\n' + validResponse + '\nEnd of response.';
    const result = parseStructuredAIResponse(surrounded);
    expect(result.coverLetter).toBeDefined();
  });

  it('throws AIParseError for non-JSON text', () => {
    expect(() => parseStructuredAIResponse('This is just plain text without any JSON')).toThrow(AIParseError);
  });

  it('throws AIParseError for invalid JSON', () => {
    expect(() => parseStructuredAIResponse('{ invalid json }')).toThrow(AIParseError);
  });

  it('throws AIParseError for JSON missing required fields', () => {
    const incomplete = JSON.stringify({ coverLetter: 'A letter that is long enough to pass validation' });
    expect(() => parseStructuredAIResponse(incomplete)).toThrow(AIParseError);
  });

  it('throws AIParseError for fields that are too short', () => {
    const tooShort = JSON.stringify({
      coverLetter: 'Hi',
      cvKeywords: 'Ok',
      atsSuggestions: 'No',
      generatedCv: 'X',
    });
    expect(() => parseStructuredAIResponse(tooShort)).toThrow(AIParseError);
  });

  it('includes raw response in AIParseError', () => {
    try {
      parseStructuredAIResponse('not json');
    } catch (error) {
      expect(error).toBeInstanceOf(AIParseError);
      expect((error as AIParseError).rawResponse).toBe('not json');
    }
  });
});

describe('buildStructuredPrompt', () => {
  it('includes JSON schema instruction', () => {
    const prompt = buildStructuredPrompt({
      cvText: 'My CV content',
      jobDescription: 'Job description here',
      inputLanguage: 'English',
      hasManualInfo: false,
      manualInfoSection: '',
    });
    expect(prompt).toContain('"coverLetter"');
    expect(prompt).toContain('"cvKeywords"');
    expect(prompt).toContain('"atsSuggestions"');
    expect(prompt).toContain('"generatedCv"');
    expect(prompt).toContain('JSON');
  });

  it('includes manual info section when provided', () => {
    const prompt = buildStructuredPrompt({
      cvText: 'My CV',
      jobDescription: 'Job desc',
      inputLanguage: 'English',
      hasManualInfo: true,
      manualInfoSection: 'Name: Max',
    });
    expect(prompt).toContain('ADDITIONAL USER INFORMATION');
    expect(prompt).toContain('Name: Max');
  });

  it('omits manual info section when not provided', () => {
    const prompt = buildStructuredPrompt({
      cvText: 'My CV',
      jobDescription: 'Job desc',
      inputLanguage: 'English',
      hasManualInfo: false,
      manualInfoSection: '',
    });
    expect(prompt).not.toContain('ADDITIONAL USER INFORMATION');
  });

  it('includes CV text and job description', () => {
    const prompt = buildStructuredPrompt({
      cvText: 'My detailed CV content here',
      jobDescription: 'We are hiring a developer',
      inputLanguage: 'German',
      hasManualInfo: false,
      manualInfoSection: '',
    });
    expect(prompt).toContain('My detailed CV content here');
    expect(prompt).toContain('We are hiring a developer');
    expect(prompt).toContain('German');
  });
});
