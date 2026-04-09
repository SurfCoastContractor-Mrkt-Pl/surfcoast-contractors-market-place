import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

export function useWaveOSEligibility(userEmail) {
  return useQuery({
    queryKey: ['waveOSEligibility', userEmail],
    queryFn: async () => {
      if (!userEmail) return null;

      try {
        // Fetch contractor profile
        const contractors = await base44.entities.Contractor.filter({ email: userEmail });
        if (!contractors || contractors.length === 0) return null;

        const contractor = contractors[0];

        // Check founding member
        if (contractor.is_founding_member) {
          return {
            eligible: true,
            status: 'founding_member',
            label: 'WAVE OS Founding Member',
            color: 'blue',
          };
        }

        // Check trial status
        if (contractor.trial_active && contractor.trial_ends_at) {
          const now = new Date();
          const trialEnd = new Date(contractor.trial_ends_at);
          if (trialEnd > now) {
            return {
              eligible: true,
              status: 'trial',
              label: 'WAVE OS Free Trial',
              color: 'amber',
            };
          }
        }

        // Check subscription
        const subscriptions = await base44.entities.Subscription.filter({ user_email: userEmail, user_type: 'contractor' });
        if (subscriptions && subscriptions.length > 0) {
          const sub = subscriptions[0];
          if (sub.status === 'active') {
            return {
              eligible: true,
              status: 'subscribed',
              label: 'WAVE OS',
              color: 'blue',
            };
          }
        }

        return { eligible: false };
      } catch (error) {
        console.error('Error fetching WAVE OS eligibility:', error);
        return { eligible: false };
      }
    },
    enabled: !!userEmail,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}