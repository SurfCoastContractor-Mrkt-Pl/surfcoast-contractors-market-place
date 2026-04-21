/**
 * Authentication and authorization helpers for backend functions
 * IMPORTANT: This is a library file with exported helper functions only.
 * It does not serve as an API endpoint and should not be called directly.
 */

/**
 * Verify user is authenticated
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
 */
export async function requireAdmin(base44) {
  const user = await requireAuth(base44);
  if (user.role !== 'admin') {
    throw new Error('Forbidden: Admin access required');
  }
  return user;
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

// Serve fallback for invalid requests
Deno.serve(async () => {
  return Response.json({ error: 'This is a library module. Do not call directly.' }, { status: 400 });
});