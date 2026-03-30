import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Backend function to verify user permissions
// Usage: await base44.functions.invoke('checkUserPermission', { permission: 'admin:view_dashboard' })

// Local role definitions (duplicated to avoid import issues)
const ROLES = {
  ADMIN: 'admin',
  CONTRACTOR: 'contractor',
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  MODERATOR: 'moderator',
  USER: 'user'
};

const PERMISSIONS = {
  ADMIN_VIEW_DASHBOARD: 'admin:view_dashboard',
  ADMIN_MANAGE_USERS: 'admin:manage_users',
  ADMIN_MANAGE_COMPLIANCE: 'admin:manage_compliance',
  ADMIN_VIEW_ANALYTICS: 'admin:view_analytics',
  ADMIN_MANAGE_CONTENT: 'admin:manage_content',
  ADMIN_ESCALATE_DISPUTES: 'admin:escalate_disputes',
  CONTRACTOR_CREATE_SCOPE: 'contractor:create_scope',
  CONTRACTOR_MANAGE_JOBS: 'contractor:manage_jobs',
  CONTRACTOR_VIEW_EARNINGS: 'contractor:view_earnings',
  CONTRACTOR_ACCESS_WAVE_FO: 'contractor:access_wave_fo',
  CONTRACTOR_MANAGE_INVENTORY: 'contractor:manage_inventory',
  CONTRACTOR_UPLOAD_CREDENTIALS: 'contractor:upload_credentials',
  CUSTOMER_POST_JOBS: 'customer:post_jobs',
  CUSTOMER_REQUEST_QUOTES: 'customer:request_quotes',
  CUSTOMER_MANAGE_JOBS: 'customer:manage_jobs',
  CUSTOMER_VIEW_ORDERS: 'customer:view_orders',
  VENDOR_MANAGE_SHOP: 'vendor:manage_shop',
  VENDOR_MANAGE_LISTINGS: 'vendor:manage_listings',
  VENDOR_VIEW_SALES: 'vendor:view_sales',
  VENDOR_MANAGE_INVENTORY: 'vendor:manage_inventory',
  MODERATOR_REVIEW_CONTENT: 'moderator:review_content',
  MODERATOR_MANAGE_DISPUTES: 'moderator:manage_disputes',
  USER_MESSAGE: 'user:message',
  USER_VIEW_PROFILE: 'user:view_profile',
  USER_EDIT_PROFILE: 'user:edit_profile',
};

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: [
    PERMISSIONS.ADMIN_VIEW_DASHBOARD,
    PERMISSIONS.ADMIN_MANAGE_USERS,
    PERMISSIONS.ADMIN_MANAGE_COMPLIANCE,
    PERMISSIONS.ADMIN_VIEW_ANALYTICS,
    PERMISSIONS.ADMIN_MANAGE_CONTENT,
    PERMISSIONS.ADMIN_ESCALATE_DISPUTES,
    PERMISSIONS.USER_MESSAGE,
    PERMISSIONS.USER_VIEW_PROFILE,
    PERMISSIONS.USER_EDIT_PROFILE,
  ],
  [ROLES.CONTRACTOR]: [
    PERMISSIONS.CONTRACTOR_CREATE_SCOPE,
    PERMISSIONS.CONTRACTOR_MANAGE_JOBS,
    PERMISSIONS.CONTRACTOR_VIEW_EARNINGS,
    PERMISSIONS.CONTRACTOR_ACCESS_WAVE_FO,
    PERMISSIONS.CONTRACTOR_MANAGE_INVENTORY,
    PERMISSIONS.CONTRACTOR_UPLOAD_CREDENTIALS,
    PERMISSIONS.USER_MESSAGE,
    PERMISSIONS.USER_VIEW_PROFILE,
    PERMISSIONS.USER_EDIT_PROFILE,
  ],
  [ROLES.CUSTOMER]: [
    PERMISSIONS.CUSTOMER_POST_JOBS,
    PERMISSIONS.CUSTOMER_REQUEST_QUOTES,
    PERMISSIONS.CUSTOMER_MANAGE_JOBS,
    PERMISSIONS.CUSTOMER_VIEW_ORDERS,
    PERMISSIONS.USER_MESSAGE,
    PERMISSIONS.USER_VIEW_PROFILE,
    PERMISSIONS.USER_EDIT_PROFILE,
  ],
  [ROLES.VENDOR]: [
    PERMISSIONS.VENDOR_MANAGE_SHOP,
    PERMISSIONS.VENDOR_MANAGE_LISTINGS,
    PERMISSIONS.VENDOR_VIEW_SALES,
    PERMISSIONS.VENDOR_MANAGE_INVENTORY,
    PERMISSIONS.USER_MESSAGE,
    PERMISSIONS.USER_VIEW_PROFILE,
    PERMISSIONS.USER_EDIT_PROFILE,
  ],
  [ROLES.MODERATOR]: [
    PERMISSIONS.MODERATOR_REVIEW_CONTENT,
    PERMISSIONS.MODERATOR_MANAGE_DISPUTES,
    PERMISSIONS.USER_MESSAGE,
    PERMISSIONS.USER_VIEW_PROFILE,
  ],
  [ROLES.USER]: [
    PERMISSIONS.USER_MESSAGE,
    PERMISSIONS.USER_VIEW_PROFILE,
    PERMISSIONS.USER_EDIT_PROFILE,
  ],
};

function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false;
  }
  return ROLE_PERMISSIONS[role].includes(permission);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ authorized: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { permission, permissions } = await req.json();

    if (!permission && !permissions) {
      return Response.json({ error: 'permission or permissions required' }, { status: 400 });
    }

    const userRole = user.role || 'user';

    // Check single permission
    if (permission) {
      const authorized = hasPermission(userRole, permission);
      return Response.json({ authorized, role: userRole, permission });
    }

    // Check multiple permissions (all required)
    if (Array.isArray(permissions)) {
      const authorized = permissions.every(p => hasPermission(userRole, p));
      return Response.json({ authorized, role: userRole, permissions, checkType: 'all' });
    }

    return Response.json({ error: 'Invalid request' }, { status: 400 });
  } catch (error) {
    console.error('checkUserPermission error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});