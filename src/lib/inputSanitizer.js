/**
 * Input Sanitization Utilities
 * Prevents XSS, injection attacks, and ensures data integrity
 */

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Sanitize name fields (remove special characters, trim)
 */
export const sanitizeName = (name) => {
  if (!name) return '';
  return name
    .trim()
    .replace(/[^\p{L}\p{N}\s\-']/gu, '') // Allow letters, numbers, spaces, hyphens, apostrophes
    .substring(0, 100);
};

/**
 * Sanitize email (trim, lowercase)
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  return email.trim().toLowerCase();
};

/**
 * Sanitize phone (remove non-digit characters except +)
 */
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/[^\d\+\-\(\)\s]/g, '').trim();
};

/**
 * Sanitize location (remove special characters)
 */
export const sanitizeLocation = (location) => {
  if (!location) return '';
  return location
    .trim()
    .replace(/[^\p{L}\p{N}\s\,\-]/gu, '')
    .substring(0, 100);
};

/**
 * Sanitize URL (basic validation)
 */
export const sanitizeUrl = (url) => {
  if (!url) return '';
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
};

/**
 * Sanitize textarea/description (allow line breaks, remove HTML)
 */
export const sanitizeDescription = (text) => {
  if (!text) return '';
  return text
    .trim()
    .replace(/[<>]/g, '') // Remove angle brackets
    .substring(0, 2000);
};

/**
 * Batch sanitizer for form data
 */
export const sanitizeFormData = (data, schema) => {
  const sanitized = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (!value) {
      sanitized[key] = value;
      continue;
    }

    switch (schema?.[key]?.type) {
      case 'name':
        sanitized[key] = sanitizeName(value);
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'phone':
        sanitized[key] = sanitizePhone(value);
        break;
      case 'location':
        sanitized[key] = sanitizeLocation(value);
        break;
      case 'url':
        sanitized[key] = sanitizeUrl(value);
        break;
      case 'description':
        sanitized[key] = sanitizeDescription(value);
        break;
      default:
        sanitized[key] = sanitizeInput(value);
    }
  }

  return sanitized;
};