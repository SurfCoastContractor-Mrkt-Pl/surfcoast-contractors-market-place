/**
 * Authentication and authorization middleware helpers for backend functions
 */

/**
 * Verify user is authenticated
 * @param {Object} base44 - Base44 client
 * @returns {Promise<Object>} User object
 * @throws {Error} If not authenticated
 */
export async function requireAuth(base44) {
  const user = await base44.auth.me();
  if (!user) {
    throw new Error('Unauthorized: User not authenticated');
  }
  return user;
}

/**
 * Verify user is admin
 * @param {Object} base44 - Base44 client
 * @returns {Promise<Object>} User object
 * @throws {Error} If not admin
 */
export async function requireAdmin(base44) {
  const user = await requireAuth(base44);
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
}

/**
 * Create an authenticated response wrapper
 * Usage: return authWrapper(async () => { ... authenticated code ... })
 */
export async function authWrapper(base44, asyncFn, requireAdminRole = false) {
  try {
    const user = requireAdminRole 
      ? await requireAdmin(base44)
      : await requireAuth(base44);
    return await asyncFn(user);
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return { status: 401, error: error.message };
    }
    if (error.message.includes('Forbidden')) {
      return { status: 403, error: error.message };
    }
    throw error;
  }
}

/**
 * Validate input against a simple schema
 */
export function validateInput(data, schema) {
  const errors = {};
  Object.keys(schema).forEach((field) => {
    const rules = schema[field];
    if (rules.required && !data[field]) {
      errors[field] = `${field} is required`;
    }
    if (rules.type && data[field] && typeof data[field] !== rules.type) {
      errors[field] = `${field} must be ${rules.type}`;
    }
  });
  return Object.keys(errors).length > 0 ? errors : null;
}