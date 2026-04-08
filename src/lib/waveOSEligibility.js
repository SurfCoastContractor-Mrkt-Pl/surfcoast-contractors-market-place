/**
 * WAVE OS Tier Eligibility System
 * 
 * WAVE OS is the umbrella branding for Starter, Pro, Max, and Premium subscriptions.
 * The Residential Bundle has been discontinued — residential features are now included in Premium.
 * This module enforces tier unlock logic based on completed jobs and licensing.
 * 
 * Updated: April 8, 2026
 * - Residential Bundle tier removed
 * - Max: free messaging with past clients only
 * - Premium: free messaging with all clients + residential features
 */

export const WAVE_OS_TIERS = {
  starter: {
    name: 'WAVE OS Starter',
    stripeProductId: 'prod_UFJx2uh0L4Pj0y',
    stripePriceId: 'STRIPE_SUBSCRIPTION_PRICE_ID',
    monthlyPrice: 19,
    jobsRequired: 5,
    requiresLicense: false,
    description: 'Entry-level WAVE OS subscription',
    features: ['Job management', 'Basic scheduling', 'Messaging: $1.50/session or $50/mo unlimited'],
  },
  pro: {
    name: 'WAVE OS Pro',
    stripeProductId: 'prod_UFJxBAprP2FfPS',
    stripePriceId: 'STRIPE_SUBSCRIPTION_PRICE_ID',
    monthlyPrice: 39,
    jobsRequired: 6,
    requiresLicense: false,
    description: 'Professional WAVE OS with advanced features',
    features: ['All Starter features', 'Automated invoicing', 'Analytics & CRM', 'Price book options'],
  },
  max: {
    name: 'WAVE OS Max',
    stripeProductId: 'prod_UFJxm6E04YMx9y',
    stripePriceId: 'STRIPE_SUBSCRIPTION_PRICE_ID',
    monthlyPrice: 59,
    jobsRequired: 50,
    requiresLicense: false,
    description: 'Full field operations suite with free messaging for past clients',
    features: ['All Pro features', 'GPS tracking & field ops', 'Multi-option proposals', 'Free messaging with past clients only'],
  },
  premium: {
    name: 'WAVE OS Premium',
    stripeProductId: 'prod_UFJxSbz1OcJqQZ',
    stripePriceId: 'STRIPE_WAVE_FO_PREMIUM_PRICE_ID',
    monthlyPrice: 100,
    jobsRequired: 100,
    requiresLicense: true,
    description: 'Premium WAVE OS for licensed sole proprietors — free messaging with all clients + residential features',
    features: ['All Max features', 'Free messaging with ALL clients', 'AI scheduling assistant', 'Residential invoicing & document templates', 'HubSpot sync, Notion integration, campaign tools'],
  },
};

/**
 * Check if a contractor is eligible to subscribe to a WAVE OS tier
 * @param {string} tierKey - The tier key (starter, pro, max, premium)
 * @param {number} completedJobsCount - Number of completed jobs
 * @param {boolean} hasHISLicense - Whether contractor has H.I.S. license verified
 * @returns {object} { eligible: boolean, reason: string }
 */
/**
 * @param {string} tierKey
 * @param {number} completedJobsCount
 * @param {boolean} isLicensedSoleProprietor - contractor.is_licensed_sole_proprietor
 * @param {boolean} licenseVerified - contractor.license_verified
 */
export function checkWaveOSEligibility(tierKey, completedJobsCount, isLicensedSoleProprietor, licenseVerified) {
  const tier = WAVE_OS_TIERS[tierKey];

  if (!tier) {
    return { eligible: false, reason: 'Invalid WAVE OS tier.' };
  }

  // Check Licensed Sole Proprietor requirement (Premium)
  if (tier.requiresLicense) {
    if (!isLicensedSoleProprietor || !licenseVerified) {
      return {
        eligible: false,
        reason: `${tier.name} requires a verified professional license as a Licensed Sole Proprietor. Add your license in your profile under Credentials.`,
      };
    }
    // If license is verified, jobs requirement is waived for licensed contractors
    return { eligible: true, reason: 'Eligible for this tier.' };
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
export function getEligibleWaveOSTiers(completedJobsCount, isLicensedSoleProprietor, licenseVerified) {
  return Object.keys(WAVE_OS_TIERS).filter(tierKey => {
    const { eligible } = checkWaveOSEligibility(tierKey, completedJobsCount, isLicensedSoleProprietor, licenseVerified);
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