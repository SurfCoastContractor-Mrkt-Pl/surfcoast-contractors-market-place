/**
 * WAVE OS Tier Eligibility System
 * 
 * WAVE OS is the umbrella branding for Starter, Pro, Max, Premium, and Residential Bundle subscriptions.
 * This module enforces tier unlock logic based on completed jobs and licensing.
 */

export const WAVE_OS_TIERS = {
  starter: {
    name: 'WAVE OS Starter',
    stripeProductId: 'prod_UFJx2uh0L4Pj0y',
    stripePriceId: 'STRIPE_SUBSCRIPTION_PRICE_ID', // secret key ref
    monthlyPrice: 19,
    jobsRequired: 15,
    requiresHIS: false,
    description: 'Entry-level WAVE OS subscription',
    features: ['Job management', 'Basic scheduling', 'Client messaging'],
  },
  pro: {
    name: 'WAVE OS Pro',
    stripeProductId: 'prod_UFJxBAprP2FfPS',
    stripePriceId: 'STRIPE_SUBSCRIPTION_PRICE_ID', // Will need to map to actual Pro price
    monthlyPrice: 39,
    jobsRequired: 15,
    requiresHIS: false,
    description: 'Professional WAVE OS with advanced features',
    features: ['All Starter features', 'Advanced analytics', 'Custom invoicing', 'Team management'],
  },
  max: {
    name: 'WAVE OS Max',
    stripeProductId: 'prod_UFJxm6E04YMx9y',
    stripePriceId: 'STRIPE_SUBSCRIPTION_PRICE_ID', // Will need to map to actual Max price
    monthlyPrice: 59,
    jobsRequired: 15,
    requiresHIS: false,
    description: 'Maximum WAVE OS with all features',
    features: ['All Pro features', 'Unlimited projects', 'Priority support', 'API access'],
  },
  premium: {
    name: 'WAVE FO Premium',
    stripeProductId: 'prod_UFJxSbz1OcJqQZ',
    stripePriceId: 'STRIPE_WAVE_FO_PREMIUM_PRICE_ID',
    monthlyPrice: 100,
    jobsRequired: 0, // Not gated by jobs
    requiresHIS: true, // CRITICAL: H.I.S. license REQUIRED
    description: 'Premium WAVE OS for licensed contractors only',
    features: ['All Max features', 'Licensed-only tools', 'Compliance dashboard', 'Advanced reporting'],
  },
  residentialBundle: {
    name: 'WAVE Residential Bundle',
    stripeProductId: 'prod_UFJxMDkWRoCG8I',
    stripePriceId: 'STRIPE_RESIDENTIAL_WAVE_BUNDLE_PRICE_ID',
    monthlyPrice: 125,
    jobsRequired: 0, // Not gated by jobs
    requiresHIS: true, // CRITICAL: H.I.S. license REQUIRED
    description: 'Complete residential contracting solution',
    features: ['All Premium features', 'Residential-specific tools', 'Home improvement contracts', 'Residential Wave module'],
  },
};

/**
 * Check if a contractor is eligible to subscribe to a WAVE OS tier
 * @param {string} tierKey - The tier key (starter, pro, max, premium, residentialBundle)
 * @param {number} completedJobsCount - Number of completed jobs
 * @param {boolean} hasHISLicense - Whether contractor has H.I.S. license verified
 * @returns {object} { eligible: boolean, reason: string }
 */
export function checkWaveOSEligibility(tierKey, completedJobsCount, hasHISLicense) {
  const tier = WAVE_OS_TIERS[tierKey];

  if (!tier) {
    return { eligible: false, reason: 'Invalid WAVE OS tier.' };
  }

  // Check H.I.S. license requirement
  if (tier.requiresHIS && !hasHISLicense) {
    return {
      eligible: false,
      reason: `${tier.name} requires a verified H.I.S. (Home Improvement Salesperson) license. Add it in your profile under Credentials.`,
    };
  }

  // Check jobs requirement
  if (tier.jobsRequired > 0 && completedJobsCount < tier.jobsRequired) {
    const jobsNeeded = tier.jobsRequired - completedJobsCount;
    return {
      eligible: false,
      reason: `${tier.name} requires ${tier.jobsRequired} completed jobs. You have ${completedJobsCount}. Complete ${jobsNeeded} more to unlock.`,
    };
  }

  return { eligible: true, reason: 'Eligible for this tier.' };
}

/**
 * Get all eligible WAVE OS tiers for a contractor
 * @param {number} completedJobsCount
 * @param {boolean} hasHISLicense
 * @returns {array} Array of tier keys contractor can subscribe to
 */
export function getEligibleWaveOSTiers(completedJobsCount, hasHISLicense) {
  return Object.keys(WAVE_OS_TIERS).filter(tierKey => {
    const { eligible } = checkWaveOSEligibility(tierKey, completedJobsCount, hasHISLicense);
    return eligible;
  });
}

/**
 * Get tier details
 * @param {string} tierKey
 * @returns {object}
 */
export function getWaveOSTier(tierKey) {
  return WAVE_OS_TIERS[tierKey] || null;
}

/**
 * Map Stripe product ID to WAVE OS tier key
 * @param {string} stripeProductId
 * @returns {string|null}
 */
export function getWaveOSTierByStripeProduct(stripeProductId) {
  for (const [tierKey, tier] of Object.entries(WAVE_OS_TIERS)) {
    if (tier.stripeProductId === stripeProductId) {
      return tierKey;
    }
  }
  return null;
}