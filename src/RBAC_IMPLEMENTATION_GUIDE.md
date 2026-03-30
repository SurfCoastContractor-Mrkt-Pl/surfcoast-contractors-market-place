# RBAC System Implementation Guide

## Overview
Complete Role-Based Access Control (RBAC) system for the SurfCoast platform. Provides role definitions, permission checks, and UI components for access control.

## Architecture

### 1. Role Definitions (`lib/roleDefinitions.js`)
Centralized source of truth for all roles and permissions.

**Roles:**
- `admin` - Full platform access
- `contractor` - Contractor features (jobs, earnings, Wave FO)
- `customer` - Customer features (post jobs, request quotes)
- `vendor` - Vendor features (manage shop, listings, sales)
- `moderator` - Content moderation and dispute management
- `user` - Basic platform user

**Permissions:** Organized by scope (e.g., `admin:view_dashboard`, `contractor:create_scope`)

**Key Functions:**
```javascript
hasPermission(role, permission)           // Check single permission
hasAnyPermission(role, permissions)       // Check if role has any permission
hasAllPermissions(role, permissions)      // Check if role has all permissions
```

### 2. Backend Permission Check (`functions/checkUserPermission.js`)
Secure backend function to validate user permissions.

**Usage:**
```javascript
const response = await base44.functions.invoke('checkUserPermission', {
  permission: 'admin:view_dashboard'
});
// Returns: { authorized: true, role: 'admin', permission: '...' }
```

### 3. Frontend Hooks (`hooks/usePermission.js`)
React hooks for permission checks in frontend components.

**`usePermission(permission)`**
```javascript
const { authorized, loading, error } = usePermission('admin:view_dashboard');
```

**`useAllPermissions(permissions)`**
```javascript
const { authorized, loading, error } = useAllPermissions(['admin:manage_users', 'admin:view_analytics']);
```

### 4. UI Components (`components/auth/PermissionGate.jsx`)
Components to conditionally render based on permissions.

**`<PermissionGate>`**
```jsx
<PermissionGate 
  permission="admin:view_dashboard"
  fallback={<p>Access Denied</p>}
>
  <AdminDashboard />
</PermissionGate>
```

**`<AllPermissionsGate>`**
```jsx
<AllPermissionsGate 
  permissions={['admin:manage_users', 'admin:view_analytics']}
  fallback={<p>Insufficient Permissions</p>}
>
  <AdminPanel />
</AllPermissionsGate>
```

## Usage Examples

### 1. Protect Routes (In App.jsx)
```jsx
<PermissionGate permission="admin:view_dashboard">
  <Route path="/admin/dashboard" element={<AdminDashboard />} />
</PermissionGate>
```

### 2. Hide UI Elements
```jsx
function MyComponent() {
  const { authorized, loading } = usePermission('contractor:access_wave_fo');
  
  if (!authorized || loading) return null;
  
  return <button>Open Wave FO</button>;
}
```

### 3. Backend Functions
```javascript
import { hasPermission } from '../lib/roleDefinitions.js';

const user = await base44.auth.me();
if (!hasPermission(user.role, 'admin:manage_users')) {
  return Response.json({ error: 'Unauthorized' }, { status: 403 });
}
```

## Adding New Roles/Permissions

1. **Add to `PERMISSIONS` object** in `lib/roleDefinitions.js`
2. **Add mapping** in `ROLE_PERMISSIONS`
3. **Use in frontend/backend** via permission keys

Example:
```javascript
PERMISSIONS: {
  // ... existing
  NEW_FEATURE: 'myfeature:action',
}

ROLE_PERMISSIONS: {
  [ROLES.ADMIN]: [
    // ... existing
    PERMISSIONS.NEW_FEATURE,
  ]
}
```

## Security Notes

- Permissions are **checked on the backend** (functions/checkUserPermission.js) — frontend is advisory only
- Always validate permissions in backend functions before sensitive operations
- User role is set during authentication/registration
- Frontend checks are for UX (hiding buttons) — backend checks are for security

## Testing

Test permission checks:
```javascript
import { hasPermission } from '@/lib/roleDefinitions';

console.log(hasPermission('admin', 'admin:view_dashboard')); // true
console.log(hasPermission('user', 'admin:view_dashboard'));  // false
```

## Next Steps

1. Update User entity role enum to include new roles if needed
2. Implement role assignment during contractor/customer/vendor registration
3. Add permission checks to existing protected pages/functions
4. Use PermissionGate component for UI access control
5. Audit critical functions for permission validation