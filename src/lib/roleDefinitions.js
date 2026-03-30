// RBAC Role & Permission Definitions
// Centralized source of truth for all platform roles and their permissions

export const ROLES = {
  ADMIN: 'admin',
  CONTRACTOR: 'contractor',
  CUSTOMER: 'customer',
  VENDOR: 'vendor',
  MODERATOR: 'moderator',
  USER: 'user'
};

export const PERMISSIONS = {
  // Admin permissions
  ADMIN_VIEW_DASHBOARD: 'admin:view_dashboard',
  ADMIN_MANAGE_USERS: 'admin:manage_users',
  ADMIN_MANAGE_COMPLIANCE: 'admin:manage_compliance',
  ADMIN_VIEW_ANALYTICS: 'admin:view_analytics',
  ADMIN_MANAGE_CONTENT: 'admin:manage_content',
  ADMIN_ESCALATE_DISPUTES: 'admin:escalate_disputes',

  // Contractor permissions
  CONTRACTOR_CREATE_SCOPE: 'contractor:create_scope',
  CONTRACTOR_MANAGE_JOBS: 'contractor:manage_jobs',
  CONTRACTOR_VIEW_EARNINGS: 'contractor:view_earnings',
  CONTRACTOR_ACCESS_WAVE_FO: 'contractor:access_wave_fo',
  CONTRACTOR_MANAGE_INVENTORY: 'contractor:manage_inventory',
  CONTRACTOR_UPLOAD_CREDENTIALS: 'contractor:upload_credentials',

  // Customer permissions
  CUSTOMER_POST_JOBS: 'customer:post_jobs',
  CUSTOMER_REQUEST_QUOTES: 'customer:request_quotes',
  CUSTOMER_MANAGE_JOBS: 'customer:manage_jobs',
  CUSTOMER_VIEW_ORDERS: 'customer:view_orders',

  // Vendor permissions
  VENDOR_MANAGE_SHOP: 'vendor:manage_shop',
  VENDOR_MANAGE_LISTINGS: 'vendor:manage_listings',
  VENDOR_VIEW_SALES: 'vendor:view_sales',
  VENDOR_MANAGE_INVENTORY: 'vendor:manage_inventory',

  // Moderator permissions
  MODERATOR_REVIEW_CONTENT: 'moderator:review_content',
  MODERATOR_MANAGE_DISPUTES: 'moderator:manage_disputes',

  // General permissions
  USER_MESSAGE: 'user:message',
  USER_VIEW_PROFILE: 'user:view_profile',
  USER_EDIT_PROFILE: 'user:edit_profile',
};

// Role-to-permissions mapping
export const ROLE_PERMISSIONS = {
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

// Check if a role has a specific permission
export function hasPermission(role, permission) {
  if (!role || !ROLE_PERMISSIONS[role]) {
    return false;
  }
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Check if a role has any of the specified permissions
export function hasAnyPermission(role, permissions) {
  if (!Array.isArray(permissions)) {
    return hasPermission(role, permissions);
  }
  return permissions.some(p => hasPermission(role, p));
}

// Check if a role has all of the specified permissions
export function hasAllPermissions(role, permissions) {
  if (!Array.isArray(permissions)) {
    return hasPermission(role, permissions);
  }
  return permissions.every(p => hasPermission(role, p));
}