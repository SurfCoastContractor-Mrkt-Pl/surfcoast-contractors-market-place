import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

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
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { subscriptionId, cardData } = await req.json();

    if (!subscriptionId || !cardData) {
      return Response.json(
        { error: 'Missing subscriptionId or cardData' },
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

    // Create token from card data
    const token = await stripe.tokens.create({
      card: {
        number: cardData.cardNumber.replace(/\s/g, ''),
        exp_month: parseInt(cardData.expiryMonth),
        exp_year: parseInt(cardData.expiryYear),
        cvc: cardData.cvc
      }
    });

    // Get Stripe subscription
    const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);

    // Update customer default payment method
    await stripe.customers.update(stripeSubscription.customer, {
      source: token.id
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