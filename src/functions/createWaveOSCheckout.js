/**
 * Create Stripe checkout session for WAVE OS subscription
 * Validates tier eligibility before creating session
 */

/* eslint-disable no-undef */
import Stripe from 'npm:stripe@13.10.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

const WAVE_OS_TIERS = {
  starter: { jobsRequired: 15, requiresHIS: false },
  pro: { jobsRequired: 15, requiresHIS: false },
  max: { jobsRequired: 15, requiresHIS: false },
  premium: { jobsRequired: 0, requiresHIS: true },
  residentialBundle: { jobsRequired: 0, requiresHIS: true },
};

const STRIPE_PRODUCT_TO_TIER = {
  'prod_UFJx2uh0L4Pj0y': 'starter',
  'prod_UFJxBAprP2FfPS': 'pro',
  'prod_UFJxm6E04YMx9y': 'max',
  'prod_UFJxSbz1OcJqQZ': 'premium',
  'prod_UFJxMDkWRoCG8I': 'residentialBundle',
};

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST only' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { stripeProductId, contractorEmail, successUrl, cancelUrl } = await req.json();

    if (!stripeProductId || !contractorEmail) {
      return Response.json(
        { error: 'Missing stripeProductId or contractorEmail' },
        { status: 400 }
      );
    }

    // Get tier from Stripe product ID
    const tierKey = STRIPE_PRODUCT_TO_TIER[stripeProductId];
    if (!tierKey) {
      return Response.json(
        { error: 'Invalid Stripe product ID for WAVE OS' },
        { status: 400 }
      );
    }

    const tier = WAVE_OS_TIERS[tierKey];

    // Fetch contractor data
    const contractors = await base44.entities.Contractor.filter({
      email: contractorEmail,
    });

    if (!contractors || contractors.length === 0) {
      return Response.json(
        { error: 'Contractor profile not found' },
        { status: 404 }
      );
    }

    const contractor = contractors[0];
    const completedJobsCount = contractor.completed_jobs_count || 0;
    const hasHISLicense = contractor.his_license_verified || false;

    // VALIDATION: Check H.I.S. license requirement
    if (tier.requiresHIS && !hasHISLicense) {
      console.warn(
        `[WAVE OS Checkout] Tier unlock denied: ${contractorEmail} lacks H.I.S. license for tier ${tierKey}`
      );
      return Response.json(
        {
          error: 'Tier requires H.I.S. license',
          eligible: false,
          reason: `${tierKey} requires a verified H.I.S. (Home Improvement Salesperson) license.`,
        },
        { status: 403 }
      );
    }

    // VALIDATION: Check jobs requirement
    if (tier.jobsRequired > 0 && completedJobsCount < tier.jobsRequired) {
      const jobsNeeded = tier.jobsRequired - completedJobsCount;
      console.warn(
        `[WAVE OS Checkout] Tier unlock denied: ${contractorEmail} has ${completedJobsCount}/${tier.jobsRequired} jobs for tier ${tierKey}`
      );
      return Response.json(
        {
          error: 'Insufficient completed jobs',
          eligible: false,
          reason: `${tierKey} requires ${tier.jobsRequired} completed jobs. You have ${completedJobsCount}.`,
          completedJobsCount,
          jobsRequired: tier.jobsRequired,
          jobsNeeded,
        },
        { status: 403 }
      );
    }

    // CREATE CHECKOUT SESSION
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: stripeProductId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${Deno.env.get('APP_URL')}/success`,
      cancel_url: cancelUrl || `${Deno.env.get('APP_URL')}/cancel`,
      customer_email: contractorEmail,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        contractor_email: contractorEmail,
        tier: tierKey,
        completed_jobs_count: completedJobsCount,
      },
    });

    console.log(
      `[WAVE OS Checkout] Session created: ${session.id} for ${contractorEmail} (tier: ${tierKey})`
    );

    return Response.json(
      {
        success: true,
        sessionId: session.id,
        url: session.url,
        tier: tierKey,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[WAVE OS Checkout] Error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});