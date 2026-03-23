import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@16.11.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { user_email, user_type } = body;

    if (!user_email || !user_type) {
      return Response.json({ error: 'Missing user_email or user_type' }, { status: 400 });
    }

    // Check if user has already claimed
    const existingClaim = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({
      user_email: user_email
    });

    if (existingClaim && existingClaim.length > 0) {
      const existing = existingClaim[0];
      return Response.json({
        claimed: true,
        eligible: existing.is_eligible,
        message: existing.is_eligible 
          ? 'You have claimed the early adopter free year!' 
          : 'You missed the early adopter offer (limit: 100 users)'
      });
    }

    // Count how many have already claimed
    const allClaims = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({
      is_eligible: true
    });

    const claimOrder = allClaims.length + 1;
    const isEligible = claimOrder <= 100;

    // Get or create Stripe customer
    let stripeCustomerId;
    const savedPaymentMethods = await base44.asServiceRole.entities.SavedPaymentMethod.filter({
      user_email: user_email
    });

    if (savedPaymentMethods && savedPaymentMethods.length > 0) {
      stripeCustomerId = savedPaymentMethods[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        email: user_email,
        metadata: { base44_user_email: user_email }
      });
      stripeCustomerId = customer.id;
    }

    // Create or update subscription with trial if eligible
    let stripeSubscriptionId = null;
    if (isEligible) {
      const subscriptionData = {
        customer: stripeCustomerId,
        items: [
          {
            price: Deno.env.get("STRIPE_SUBSCRIPTION_PRICE_ID")
          }
        ],
        trial_period_days: 365,
        metadata: {
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
          early_adopter_waiver: 'true'
        }
      };

      const subscription = await stripe.subscriptions.create(subscriptionData);
      stripeSubscriptionId = subscription.id;
    }

    // Record the waiver claim
    const waiver = await base44.asServiceRole.entities.EarlyAdopterWaiver.create({
      user_email: user_email,
      user_type: user_type,
      profile_completed_at: new Date().toISOString(),
      claimed_at: new Date().toISOString(),
      claim_order: claimOrder,
      is_eligible: isEligible,
      stripe_subscription_id: stripeSubscriptionId,
      trial_applied_at: isEligible ? new Date().toISOString() : null,
      waiver_status: isEligible ? 'approved' : 'missed_deadline'
    });

    // Send notification email
    if (isEligible) {
      await base44.integrations.Core.SendEmail({
        to: user_email,
        subject: '🎉 You\'ve Claimed Your 1-Year Free Membership!',
        body: `Congratulations! You're among the first 100 users to complete your profile. 
        
Your subscription is now active with a full year free (you're responsible for transaction fees only). 
After the first year, you'll be charged the standard membership rate. You can manage or cancel anytime.

Welcome to SurfCoast!`
      });
    } else {
      await base44.integrations.Core.SendEmail({
        to: user_email,
        subject: 'Early Adopter Offer - Limit Reached',
        body: `Thank you for completing your profile! The early adopter offer has reached its 100-user limit. 
        
However, we have other promotions coming soon. Keep an eye on your inbox for opportunities to save.`
      });
    }

    return Response.json({
      success: true,
      claimed: true,
      eligible: isEligible,
      claimOrder: claimOrder,
      message: isEligible 
        ? `You're #${claimOrder} to claim the free year! Enjoy your 1-year membership at no cost.`
        : `The early adopter offer has reached its 100-user limit. We appreciate your interest!`
    });
  } catch (error) {
    console.error('Error claiming early adopter waiver:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});