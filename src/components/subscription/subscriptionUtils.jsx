import { base44 } from '@/api/base44Client';

export async function hasActiveSubscription(userEmail) {
  try {
    const subscriptions = await base44.entities.Subscription.filter({
      user_email: userEmail,
      status: 'active',
    });

    if (!subscriptions || subscriptions.length === 0) {
      return false;
    }

    const subscription = subscriptions[0];
    const periodEnd = new Date(subscription.current_period_end);
    
    // Check if subscription is still within current period
    return periodEnd > new Date();
  } catch (error) {
    console.error('Error checking subscription:', error);
    return false;
  }
}