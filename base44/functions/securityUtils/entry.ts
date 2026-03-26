/**
 * Centralized security utilities for backend functions
 */

/**
 * Validate internal service key
 */
export function validateInternalServiceKey(providedKey) {
  const validKey = Deno.env.get('INTERNAL_SERVICE_KEY');
  if (!validKey || !providedKey) {
    return false;
  }
  return providedKey === validKey;
}

/**
 * Generate cryptographically secure random token
 */
export function generateSecureToken(length = 32) {
  const bytes = new Uint8Array(Math.ceil(length / 2));
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, length);
}

/**
 * Generate cryptographically secure numeric code
 */
export function generateSecureNumericCode(length = 8) {
  let code = '';
  const array = new Uint32Array(1);
  for (let i = 0; i < length; i++) {
    crypto.getRandomValues(array);
    code += (array[0] % 10).toString();
  }
  return code;
}

/**
 * Sanitize email content to prevent injection
 */
export function sanitizeEmailContent(text) {
  if (!text) return '';
  return String(text)
    .replace(/\r/g, '')
    .replace(/\n\./g, '\n..')
    .trim();
}

/**
 * Check if user is admin
 */
export function isAdminUser(user) {
  return user && user.role === 'admin';
}