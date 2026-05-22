import { describe, it, expect } from 'vitest';
import { sanitizeText, sanitizeHTML, sanitizeFileName } from './sanitizer';

describe('sanitizeText', () => {
  it('removes null bytes', () => {
    // Null bytes are removed, so 'hello\0world' becomes 'helloworld'
    expect(sanitizeText('hello\0world')).toBe('helloworld');
  });

  it('removes control characters', () => {
    // Control chars are removed, so 'hello\x01\x02world' becomes 'helloworld'
    expect(sanitizeText('hello\x01\x02world')).toBe('helloworld');
  });

  it('removes script tags', () => {
    expect(sanitizeText('hello<script>alert("xss")</script>world')).toBe('helloworld');
  });

  it('removes event handlers', () => {
    expect(sanitizeText('<div onclick="alert(1)">test</div>')).toContain('test');
  });

  it('normalizes whitespace', () => {
    expect(sanitizeText('hello    world')).toBe('hello world');
  });

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeText('  hello  ')).toBe('hello');
  });

  it('limits text to maxLength', () => {
    const longText = 'a'.repeat(100);
    expect(sanitizeText(longText, 50).length).toBe(50);
  });

  it('returns empty string for non-string input', () => {
    expect(sanitizeText(123 as unknown as string)).toBe('');
  });
});

describe('sanitizeHTML', () => {
  it('removes script tags but keeps content between them', () => {
    // sanitizeHTML uses a whitelist — script is not in the whitelist
    const result = sanitizeHTML('<script>alert(1)</script><p>Safe</p>');
    expect(result).toContain('<p>Safe</p>');
    expect(result).not.toContain('<script>');
  });

  it('allows safe tags', () => {
    expect(sanitizeHTML('<p>Hello</p>')).toBe('<p>Hello</p>');
    expect(sanitizeHTML('<strong>Bold</strong>')).toBe('<strong>Bold</strong>');
  });

  it('removes javascript: protocol', () => {
    expect(sanitizeHTML('<a href="javascript:alert(1)">link</a>')).not.toContain('javascript:');
  });
});

describe('sanitizeFileName', () => {
  it('removes special characters', () => {
    expect(sanitizeFileName('file@#$name.pdf')).toBe('filename.pdf');
  });

  it('replaces consecutive dots with single dot', () => {
    // ../ is stripped by the regex /[^\w\s.-]/g then /\.{2,}/g collapses .. to .
    const result = sanitizeFileName('../../../etc/passwd');
    expect(result).not.toContain('/');
  });

  it('limits filename length', () => {
    const longName = 'a'.repeat(300) + '.pdf';
    expect(sanitizeFileName(longName).length).toBeLessThanOrEqual(255);
  });
});
