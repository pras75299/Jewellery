// Simple HTML sanitization
// For production, use a library like DOMPurify

const ALLOWED_TAGS = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'];
const ALLOWED_ATTRIBUTES: string[] = [];

export function sanitizeHtml(html: string): string {
  if (!html) return '';

  // Remove script tags and event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/on\w+="[^"]*"/gi, '')
    .replace(/on\w+='[^']*'/gi, '');

  // Remove style tags
  sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove javascript: and data: protocols
  sanitized = sanitized.replace(/javascript:/gi, '');
  sanitized = sanitized.replace(/data:/gi, '');

  // Basic tag whitelist (simple implementation)
  // For production, use DOMPurify or similar
  const tagRegex = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi;
  sanitized = sanitized.replace(tagRegex, (match, tag) => {
    const lowerTag = tag.toLowerCase();
    if (ALLOWED_TAGS.includes(lowerTag)) {
      // Remove attributes from allowed tags
      return `<${lowerTag}>`;
    }
    return '';
  });

  return sanitized.trim();
}

export function sanitizeText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/<[^>]*>/g, '') // Remove all HTML tags
    .replace(/&[#\w]+;/g, '') // Remove HTML entities
    .trim();
}

