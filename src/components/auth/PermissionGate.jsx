import React, { useEffect, useState } from 'react';
import { usePermission } from '@/hooks/usePermission';
import { base44 } from '@/api/base44Client';

// Component to conditionally render content based on permissions
// Usage: <PermissionGate permission="admin:view_dashboard"><AdminDashboard /></PermissionGate>

export default function PermissionGate({ 
  permission, 
  children, 
  fallback = null,
  loadingFallback = <div className="text-sm text-slate-500">Loading...</div>
}) {
  const { authorized, loading } = usePermission(permission);

  if (loading) {
    return loadingFallback;
  }

  if (!authorized) {
    return fallback;
  }

  return <>{children}</>;
}

// Component for multiple permissions (all required)
export function AllPermissionsGate({ 
  permissions, 
  children, 
  fallback = null,
  loadingFallback = <div className="text-sm text-slate-500">Loading...</div>
}) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!Array.isArray(permissions) || permissions.length === 0) {
      setLoading(false);
      return;
    }

    const checkPermissions = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('checkUserPermission', {
          permissions
        });
        setAuthorized(response.data?.authorized || false);
      } catch {
        setAuthorized(false);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [permissions]);

  if (loading) {
    return loadingFallback;
  }

  if (!authorized) {
    return fallback;
  }

  return <>{children}</>;
}