import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

// Hook to check user permissions on the frontend
// Usage: const { authorized, loading } = usePermission('admin:view_dashboard');

export function usePermission(permission) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!permission) {
      setLoading(false);
      return;
    }

    const checkPermission = async () => {
      try {
        setLoading(true);
        const response = await base44.functions.invoke('checkUserPermission', {
          permission
        });
        setAuthorized(response.data?.authorized || false);
        setError(null);
      } catch (err) {
        setAuthorized(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkPermission();
  }, [permission]);

  return { authorized, loading, error };
}

// Hook to check multiple permissions (all required)
export function useAllPermissions(permissions) {
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setError(null);
      } catch (err) {
        setAuthorized(false);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    checkPermissions();
  }, [permissions]);

  return { authorized, loading, error };
}