import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@16.0.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

/**
 * SECURITY: SSRF Protection
 * This function handles sensitive payment method updates. If card data 
 * fetching or reupload is implemented, ensure ALLOWED_IMAGE_DOMAINS 
 * and ALLOWED_EVIDENCE_DOMAINS environment variables are strictly 
 * configured with only trusted domains to prevent Server-Side Request 
 * Forgery (SSRF) attacks. Never allow arbitrary URLs.
 */

Deno.serve(async (req) => {
  try {
    let stripe;
    try {
      stripe = initializeStripe();
    } catch (initErr) {
      console.error('Stripe initialization failed:', initErr.message);
      return Response.json({
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, paymentMethodId } = await req.json();

    if (!subscriptionId || !paymentMethodId) {
      return Response.json(
        { error: 'Missing subscriptionId or paymentMethodId' },
        { status: 400 }
      );
    }

    // Fetch subscription from database
    const subscriptions = await base44.entities.Subscription.filter({
      stripe_subscription_id: subscriptionId,
      user_email: user.email
    });

    const subscription = subscriptions?.[0];
    if (!subscription) {
      return Response.json({ error: 'Subscription not found' }, { status: 404 });
    }

    // SECURITY: Card data must be tokenized on frontend via Stripe.js
    // Backend should only receive the payment method ID (already tokenized by Stripe)
    // Never accept raw card details (number, CVC, expiry) on the backend

    // Get Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update subscription to use the new payment method
    await stripe.subscriptions.update(subscriptionId, {
      default_payment_method: paymentMethodId
    });

    console.log(`Payment method updated for ${user.email}`);

    return Response.json({
      success: true,
      message: 'Payment method updated successfully'
    });
  } catch (error) {
    console.error('Update payment method error:', error);
    return Response.json(
      { error: error.message || 'Failed to update payment method' },
      { status: 500 }
    );
  }
});