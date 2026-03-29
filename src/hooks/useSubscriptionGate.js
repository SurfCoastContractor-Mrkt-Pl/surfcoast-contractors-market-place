import { useEffect, useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * Hook to check if user has active $50/month Communication subscription
 * Includes retry logic and error state tracking
 */
export function useSubscriptionGate() {
  const [hasSubscription, setHasSubscription] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const retryCountRef = useRef(0);
  const MAX_RETRIES = 3;

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          setHasSubscription(false);
          setLoading(false);
          setError(null);
          return;
        }

        // Check for active subscription records
        const subscriptions = await base44.entities.Subscription.filter({
          user_email: user.email,
          status: 'active'
        });

        setHasSubscription(subscriptions && subscriptions.length > 0);
        setError(null);
      } catch (error) {
        console.error('Error checking subscription:', error);
        
        // Retry logic with exponential backoff
        if (retryCountRef.current < MAX_RETRIES) {
          retryCountRef.current += 1;
          const delayMs = Math.min(1000 * Math.pow(2, retryCountRef.current - 1), 5000);
          setTimeout(() => checkSubscription(), delayMs);
          return;
        }
        
        // After max retries, default to false (deny access) and show error
        setHasSubscription(false);
        setError('Failed to verify subscription. Features may be unavailable.');
      } finally {
        setLoading(false);
      }
    };

    checkSubscription();
  }, []);

  return { hasSubscription, loading, error };
}