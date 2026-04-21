/**
 * Centralized Stripe client initialization
 * Ensures consistent secret management across all functions
 */
export function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  const Stripe = require('npm:stripe@14.16.0');
  return new Stripe(secretKey);
}