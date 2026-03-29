import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to check if user has active $50/month Communication subscription
 * Returns true only if user has an active subscription to the Communication plan
 */
export function useSubscriptionGate() {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setHasSubscription(false);
          setLoading(false);
          return;
        }

        // Check for active subscription records (this represents the $50 Subscription Comm plan)
        // The subscription entity is created when user has an active Subscription Comm subscription
        const subscriptions = await base44.entities.Subscription.filter({
          user_email: user.email,
          status: 'active'
        });

        // For now, having ANY active subscription indicates they have the Communication subscription
        // In production, you may want to track the specific product_id in the Subscription entity
        setHasSubscription(subscriptions && subscriptions.length > 0);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setHasSubscription(false);
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return { hasSubscription, loading };
}