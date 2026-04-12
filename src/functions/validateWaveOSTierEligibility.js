/**
 * Backend validation for WAVE OS tier eligibility
 * Called before creating Stripe checkout session
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// WAVE OS tier eligibility rules
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

/* eslint-disable no-undef */
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'POST only' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { stripeProductId, contractorEmail } = await req.json();

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
        { eligible: false, reason: 'Contractor profile not found.' },
        { status: 200 }
      );
    }

    const contractor = contractors[0];
    const completedJobsCount = contractor.completed_jobs_count || 0;
    const hasHISLicense = contractor.his_license_verified || false;

    // Check H.I.S. license requirement
    if (tier.requiresHIS && !hasHISLicense) {
      return Response.json(
        {
          eligible: false,
          reason: `This WAVE OS tier requires a verified H.I.S. (Home Improvement Salesperson) license. Add it in your profile under Credentials.`,
          tierKey,
        },
        { status: 200 }
      );
    }

    // Check jobs requirement
    if (tier.jobsRequired > 0 && completedJobsCount < tier.jobsRequired) {
      const jobsNeeded = tier.jobsRequired - completedJobsCount;
      return Response.json(
        {
          eligible: false,
          reason: `This WAVE OS tier requires ${tier.jobsRequired} completed jobs. You have ${completedJobsCount}. Complete ${jobsNeeded} more to unlock.`,
          tierKey,
          completedJobsCount,
          jobsRequired: tier.jobsRequired,
        },
        { status: 200 }
      );
    }

    // Eligible
    return Response.json(
      {
        eligible: true,
        reason: 'Contractor is eligible for this WAVE OS tier.',
        tierKey,
        completedJobsCount,
        contractorName: contractor.name,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('validateWaveOSTierEligibility error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});