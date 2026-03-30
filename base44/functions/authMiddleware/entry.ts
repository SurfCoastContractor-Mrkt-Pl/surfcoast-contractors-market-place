import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Authentication and authorization helpers for backend functions
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

// Simple test endpoint
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  try {
    const base44 = createClientFromRequest(req);
    const user = await requireAuth(base44);
    return Response.json({ success: true, user });
  } catch (error) {
    if (error.message.includes('Unauthorized')) {
      return Response.json({ error: error.message }, { status: 401 });
    }
    if (error.message.includes('Forbidden')) {
      return Response.json({ error: error.message }, { status: 403 });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});