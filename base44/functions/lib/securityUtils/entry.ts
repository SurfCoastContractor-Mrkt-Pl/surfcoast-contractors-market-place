/**
 * Centralized security utilities for backend functions.
 * This file is a shared library — it is NOT a standalone endpoint.
 * The Deno.serve wrapper below returns 404 to satisfy the platform's deployment
 * requirement while preventing any accidental direct invocation.
 */

Deno.serve(async (_req) => {
  return Response.json({ error: 'Not found' }, { status: 404 });
});

/**
 * Validate internal service key - all internal service calls should use this
 * @param {string} providedKey - The key provided in the request
 * @returns {boolean} - True if key matches INTERNAL_SERVICE_KEY
 */
export function validateInternalServiceKey(providedKey) {
  const validKey = Deno.env.get('INTERNAL_SERVICE_KEY');
  if (!validKey || !providedKey) {
    console.error('Security: INTERNAL_SERVICE_KEY validation failed - missing key');
    return false;
  }
  return providedKey === validKey;
}

/**
 * Validate admin password hash
 * @param {string} providedHash - The hash to validate
 * @returns {boolean} - True if hash matches ADMIN_PASSWORD_HASH
 */
export function validateAdminPasswordHash(providedHash) {
  const validHash = Deno.env.get('ADMIN_PASSWORD_HASH');
  if (!validHash || !providedHash) {
    console.error('Security: Admin password validation failed - missing hash');
    return false;
  }
  return providedHash === validHash;
}

/**
 * Generate cryptographically secure random token
 * @param {number} length - Length of token to generate
 * @returns {string} - Random hex string
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
 * @param {number} length - Length of code (default 8)
 * @returns {string} - Random numeric string
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
 * Sanitize email body to prevent injection attacks
 * @param {string} text - Text to sanitize
 * @returns {string} - Sanitized text
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
 * @param {object} user - User object from base44.auth.me()
 * @returns {boolean} - True if user has admin role
 */
export function isAdminUser(user) {
  return user && user.role === 'admin';
}

/**
 * Get safe demo email domain (from env or fallback)
 * @returns {string} - Demo email domain
 */
export function getDemoDomain() {
  return Deno.env.get('DEMO_EMAIL_DOMAIN') || 'demo.local';
}

/**
 * Rate limit checker using email/identifier
 * @param {string} identifier - User email or unique identifier
 * @param {number} maxPerMinute - Max requests per minute
 * @returns {boolean} - True if within rate limit
 */
export async function checkRateLimit(identifier, maxPerMinute = 5) {
  console.log(`Rate limit check for ${identifier}: ${maxPerMinute} per minute`);
  return true; // TODO: Implement with persistent store
}