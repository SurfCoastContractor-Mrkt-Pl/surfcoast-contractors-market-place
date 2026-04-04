/**
 * Trial & Founding Member Configuration
 * - First 100 signups: 1 year free access
 * - After 100: 14 days free access
 * - Referral extension: +1 day per successful referral (max 5 days during trial)
 */

export const TRIAL_CONFIG = {
  FOUNDING_MEMBER_COUNT: 100,
  FOUNDING_MEMBER_DAYS: 365, // 1 year
  STANDARD_TRIAL_DAYS: 14,
  REFERRAL_BONUS_DAYS: 1,
  MAX_REFERRAL_EXTENSIONS: 5, // Max +5 days via referrals
};

/**
 * Calculate trial end date based on signup count and referral bonus
 * @param {number} totalSignupCount - Total number of users signed up (cumulative)
 * @param {number} referralCount - Number of successful referrals completed
 * @returns {Object} { trialEndDate, isFoundingMember, daysRemaining }
 */
export function calculateTrialEnd(totalSignupCount, referralCount = 0) {
  const now = new Date();
  const isFoundingMember = totalSignupCount <= TRIAL_CONFIG.FOUNDING_MEMBER_COUNT;
  
  let trialDays = isFoundingMember
    ? TRIAL_CONFIG.FOUNDING_MEMBER_DAYS
    : TRIAL_CONFIG.STANDARD_TRIAL_DAYS;

  // Add referral bonus days (only during trial period, max 5)
  if (!isFoundingMember && referralCount > 0) {
    const bonusDays = Math.min(
      referralCount * TRIAL_CONFIG.REFERRAL_BONUS_DAYS,
      TRIAL_CONFIG.MAX_REFERRAL_EXTENSIONS
    );
    trialDays += bonusDays;
  }

  const trialEndDate = new Date(now);
  trialEndDate.setDate(trialEndDate.getDate() + trialDays);

  return {
    trialEndDate: trialEndDate.toISOString(),
    isFoundingMember,
    daysRemaining: trialDays,
    referralBonus: !isFoundingMember ? Math.min(referralCount, TRIAL_CONFIG.MAX_REFERRAL_EXTENSIONS) : 0,
  };
}

/**
 * Check if user trial is still active
 * @param {string} trialEndDate - ISO string of trial end date
 * @returns {boolean}
 */
export function isTrialActive(trialEndDate) {
  if (!trialEndDate) return false;
  return new Date(trialEndDate) > new Date();
}

/**
 * Get days remaining in trial
 * @param {string} trialEndDate - ISO string of trial end date
 * @returns {number} Days remaining (0 if expired)
 */
export function getDaysRemaining(trialEndDate) {
  if (!trialEndDate || !isTrialActive(trialEndDate)) return 0;
  
  const now = new Date();
  const end = new Date(trialEndDate);
  const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}