import { base44 } from '@/api/base44Client';

/**
 * Service role operations for admin tasks
 * These bypass normal RLS for administrative functions
 */

// Note: These must be called from backend functions, not frontend
// They require base44.asServiceRole context from createClientFromRequest(req)

export const serviceRoleExamples = {
  // Create records as admin (bypasses RLS)
  createAsAdmin: async (base44, entity, data) => {
    return await base44.asServiceRole.entities[entity].create(data);
  },

  // Update records as admin
  updateAsAdmin: async (base44, entity, id, data) => {
    return await base44.asServiceRole.entities[entity].update(id, data);
  },

  // Delete records as admin
  deleteAsAdmin: async (base44, entity, id) => {
    return await base44.asServiceRole.entities[entity].delete(id);
  },

  // List all records as admin (ignores RLS)
  listAsAdmin: async (base44, entity, limit = 100) => {
    return await base44.asServiceRole.entities[entity].list('', limit);
  },

  // Filter with admin privileges
  filterAsAdmin: async (base44, entity, query, sort = '-created_date', limit = 100) => {
    return await base44.asServiceRole.entities[entity].filter(query, sort, limit);
  },

  // Example: Get all user data for admin dashboard
  getAllUserData: async (base44) => {
    return await base44.asServiceRole.entities.User.list('', 1000);
  },

  // Example: Get all error logs
  getAllErrors: async (base44) => {
    return await base44.asServiceRole.entities.ErrorLog.filter(
      { resolved: false },
      '-created_date',
      100
    );
  },

  // Example: Get activity audit trail
  getActivityLog: async (base44, userId = null, limit = 100) => {
    const query = userId ? { user_email: userId } : {};
    return await base44.asServiceRole.entities.ActivityLog.filter(
      query,
      '-created_date',
      limit
    );
  },
};