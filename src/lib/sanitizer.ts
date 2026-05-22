/**
 * Input sanitization utility for BewerbungGenie.
 * Removes potentially harmful content while preserving useful text.
 */

/**
 * Sanitize text input by removing control characters and limiting length.
 * This is the primary sanitization function for all user text inputs.
 */
export function sanitizeText(text: string, maxLength: number = 50000): string {
  if (typeof text !== 'string') return '';

  return text
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, '')
    .replace(/on\w+\s*=\s*"[^"]*"/gi, '')
    .replace(/on\w+\s*=\s*'[^']*'/gi, '')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .substring(0, maxLength);
}

/**
 * Sanitize HTML content for safe rendering.
 * Uses a whitelist approach — only allows specific safe tags.
 */
export function sanitizeHTML(html: string): string {
  return html
    .replace(/<(?!\/?(?:p|br|strong|em|ul|ol|li|h[1-6]|blockquote|a)\b)[^>]*>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, 'data-removed=');
}

/**
 * Validate and sanitize a file name.
 */
export function sanitizeFileName(name: string): string {
  return name
    .replace(/[^\w\s.-]/g, '')
    .replace(/\.{2,}/g, '.')
    .trim()
    .substring(0, 255);
}
