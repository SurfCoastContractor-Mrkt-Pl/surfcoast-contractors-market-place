import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

/**
 * Reusable hook for fetching authenticated user data with caching
 * Uses React Query for automatic caching and background refetching
 */
export function useUserData() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['auth', 'currentUser'],
    queryFn: async () => {
      try {
        return await base44.auth.me();
      } catch (e) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false,
  });

  return { user, isLoading, error };
}

/**
 * Hook for fetching user profiles (contractor, market shop, customer) with automatic cleanup
 */
export function useUserProfiles(email) {
  const { data: profiles = {}, isLoading, error } = useQuery({
    queryKey: ['profiles', email],
    queryFn: async () => {
      if (!email) return {};
      
      const [contractors, marketShops, customers] = await Promise.all([
        base44.entities.Contractor.filter({ email }).catch(() => []),
        base44.entities.MarketShop.filter({ email }).catch(() => []),
        base44.entities.CustomerProfile.filter({ email }).catch(() => []),
      ]);

      return {
        isContractor: contractors?.length > 0,
        hasMarketShop: marketShops?.length > 0,
        hasCustomerProfile: customers?.length > 0,
      };
    },
    enabled: !!email,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes (cleanup after unmount)
  });

  return {
    isContractor: profiles.isContractor || false,
    hasMarketShop: profiles.hasMarketShop || false,
    hasCustomerProfile: profiles.hasCustomerProfile || false,
    isLoading,
    error,
  };
}

/**
 * Hook for fetching unread message count with auto-cleanup on unmount
 */
export function useUnreadCount(email) {
  const { data: unreadCount = 0, isLoading, error } = useQuery({
    queryKey: ['messages', 'unread', email],
    queryFn: async () => {
      if (!email) return 0;
      const unreadMessages = await base44.entities.Message.filter({ recipient_email: email, read: false }).catch(() => []);
      return unreadMessages?.length || 0;
    },
    enabled: !!email,
    staleTime: 3 * 60 * 1000, // 3 minutes (slightly relaxed for better performance)
    gcTime: 5 * 60 * 1000, // 5 minutes (cleanup after unmount)
  });

  return { unreadCount, isLoading, error };
}