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
 * Hook for fetching user profiles (contractor, market shop, customer)
 */
export function useUserProfiles(email) {
  const { data: profiles = {}, isLoading, error } = useQuery({
    queryKey: ['profiles', email],
    queryFn: async () => {
      if (!email) return {};
      
      const [contractors, marketShops, customers] = await Promise.all([
        base44.entities.Contractor.filter({ email }),
        base44.entities.MarketShop.filter({ email }),
        base44.entities.CustomerProfile.filter({ email }),
      ]);

      return {
        isContractor: contractors?.length > 0,
        hasMarketShop: marketShops?.length > 0,
        hasCustomerProfile: customers?.length > 0,
      };
    },
    enabled: !!email,
    staleTime: 10 * 60 * 1000, // 10 minutes
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
 * Hook for fetching unread message count
 */
export function useUnreadCount(email) {
  const { data: unreadCount = 0, isLoading, error } = useQuery({
    queryKey: ['messages', 'unread', email],
    queryFn: async () => {
      if (!email) return 0;

      try {
        const [unreadMessages, unreadProjectMessages] = await Promise.all([
          base44.entities.Message.filter({ recipient_email: email, read: false }),
          base44.entities.ProjectMessage.filter({ recipient_email: email, sender_email: { $ne: email }, read: false })
        ]);

        return (unreadMessages?.length || 0) + (unreadProjectMessages?.length || 0);
      } catch (e) {
        console.error('Failed to fetch unread count:', e);
        return 0;
      }
    },
    enabled: !!email,
    staleTime: 2 * 60 * 1000, // 2 minutes (refresh more frequently for messages)
  });

  return { unreadCount, isLoading, error };
}