// Tier-based feature configuration for QuoteService system
export const TIER_FEATURES = {
  standard: {
    maxServices: 10,
    maxServicePackages: 0,
    pdfTemplates: ['basic'],
    emailCustomization: false,
    emailTracking: false,
    serviceCategories: ['electrical', 'plumbing', 'hvac', 'carpentry', 'roofing', 'painting', 'general_labor'],
    advancedAnalytics: false,
    // New features
    maxCampaigns: 0,
    crm: 'none', // none, basic, advanced
    reviewManagement: false,
    maxActiveCampaigns: 0,
    campaignAnalytics: false,
    customerNotes: false,
    communicationHistory: false,
    reviewRequests: false,
    reviewAnalytics: false,
  },
  licensed: {
    maxServices: 50,
    maxServicePackages: 5,
    pdfTemplates: ['basic', 'professional'],
    emailCustomization: true,
    emailTracking: false,
    serviceCategories: ['electrical', 'plumbing', 'hvac', 'carpentry', 'roofing', 'painting', 'landscaping', 'masonry', 'welding', 'tiling', 'general_labor', 'consulting'],
    advancedAnalytics: false,
    // New features
    maxCampaigns: 3,
    crm: 'basic', // basic customer profiles
    reviewManagement: true,
    maxActiveCampaigns: 3,
    campaignAnalytics: true,
    customerNotes: true,
    communicationHistory: true,
    reviewRequests: true,
    reviewAnalytics: false,
  },
  premium: {
    maxServices: -1, // unlimited
    maxServicePackages: -1, // unlimited
    pdfTemplates: ['basic', 'professional', 'premium', 'custom'],
    emailCustomization: true,
    emailTracking: true,
    serviceCategories: '*', // all
    advancedAnalytics: true,
    // New features
    maxCampaigns: -1, // unlimited
    crm: 'advanced', // full CRM with integrations
    reviewManagement: true,
    maxActiveCampaigns: -1,
    campaignAnalytics: true,
    customerNotes: true,
    communicationHistory: true,
    reviewRequests: true,
    reviewAnalytics: true,
  },
};

export const getTierFeatures = (profileTier) => {
  return TIER_FEATURES[profileTier?.toLowerCase()] || TIER_FEATURES.standard;
};

export const canAccessFeature = (profileTier, feature, currentValue) => {
  const tierFeatures = getTierFeatures(profileTier);
  const limit = tierFeatures[feature];
  
  if (limit === -1) return true; // unlimited
  if (limit === false) return false; // disabled for tier
  if (typeof limit === 'number' && typeof currentValue === 'number') {
    return currentValue < limit;
  }
  return true;
};

/**
 * WAVE OS Tier Unlock Requirements
 * Starter: 15 completed jobs
 * Pro: 35 completed jobs
 * Max: 70 completed jobs
 * Premium: 100 completed jobs OR Licensed Sole Prop with H.I.S. License (priority)
 * Residential Bundle: Licensed Sole Prop with H.I.S. License
 */
export const WAVE_OS_TIER_REQUIREMENTS = {
  starter: {
    price: 19,
    unlockType: 'performance',
    requiredCompletedJobs: 15,
    requiresLicense: false,
    requiresHISLicense: false,
  },
  pro: {
    price: 39,
    unlockType: 'performance',
    requiredCompletedJobs: 35,
    requiresLicense: false,
    requiresHISLicense: false,
  },
  max: {
    price: 59,
    unlockType: 'performance',
    requiredCompletedJobs: 70,
    requiresLicense: false,
    requiresHISLicense: false,
  },
  premium: {
    price: 100,
    unlockType: 'hybrid', // license OR 100 jobs
    requiredCompletedJobs: 100,
    requiresLicense: true,
    requiresHISLicense: true,
  },
  residential_bundle: {
    price: 125,
    unlockType: 'license',
    requiredCompletedJobs: 0,
    requiresLicense: true,
    requiresHISLicense: true,
  },
};

/**
 * Check if contractor can unlock a WAVE OS tier
 * @param {Object} contractor - Contractor data object
 * @param {string} tierName - Tier name (starter, pro, max, premium, residential_bundle)
 * @returns {Object} { canUnlock: boolean, reason: string, progress: number, required: number }
 */
export const canUnlockWaveOSTier = (contractor, tierName) => {
  const requirement = WAVE_OS_TIER_REQUIREMENTS[tierName?.toLowerCase()];
  
  if (!requirement) {
    return { canUnlock: false, reason: 'Invalid tier name' };
  }

  if (requirement.unlockType === 'performance') {
    const completedJobs = contractor?.completed_jobs_count || 0;
    if (completedJobs < requirement.requiredCompletedJobs) {
      return {
        canUnlock: false,
        reason: `Need ${requirement.requiredCompletedJobs} completed jobs (you have ${completedJobs})`,
        progress: completedJobs,
        required: requirement.requiredCompletedJobs,
      };
    }
    return { canUnlock: true, reason: 'Unlocked via job completion', progress: completedJobs, required: requirement.requiredCompletedJobs };
  }

  if (requirement.unlockType === 'license') {
    const hasLicense = contractor?.is_licensed_sole_proprietor === true;
    const hasHISLicense = contractor?.his_license_status === 'active';

    if (!hasLicense) {
      return { canUnlock: false, reason: 'Requires Licensed Sole Proprietor status' };
    }
    if (!hasHISLicense) {
      return { canUnlock: false, reason: 'Requires active H.I.S. License' };
    }
    return { canUnlock: true, reason: 'Unlocked via H.I.S. License', hasLicense, hasHISLicense };
  }

  if (requirement.unlockType === 'hybrid') {
    // Premium: unlock via license OR 100 jobs (whichever comes first)
    const hasLicense = contractor?.is_licensed_sole_proprietor === true;
    const hasHISLicense = contractor?.his_license_status === 'active';
    const completedJobs = contractor?.completed_jobs_count || 0;

    if (hasLicense && hasHISLicense) {
      return { canUnlock: true, reason: 'Unlocked via H.I.S. License', hasLicense, hasHISLicense };
    }

    if (completedJobs >= requirement.requiredCompletedJobs) {
      return { canUnlock: true, reason: 'Unlocked via 100 completed jobs', progress: completedJobs, required: requirement.requiredCompletedJobs };
    }

    return {
      canUnlock: false,
      reason: `Need H.I.S. License OR ${requirement.requiredCompletedJobs} completed jobs (you have ${completedJobs})`,
      progress: completedJobs,
      required: requirement.requiredCompletedJobs,
    };
  }

  return { canUnlock: false, reason: 'Unknown unlock type' };
};

/**
 * Get next milestone for contractor to unlock tier (performance-based only)
 * @param {Object} contractor - Contractor data object
 * @param {string} tierName - Tier name
 * @returns {Object | null} { jobsNeeded: number } or null if already unlocked
 */
export const getNextUnlockMilestone = (contractor, tierName) => {
  const requirement = WAVE_OS_TIER_REQUIREMENTS[tierName?.toLowerCase()];
  if (!requirement || requirement.unlockType !== 'performance') return null;

  const completedJobs = contractor?.completed_jobs_count || 0;
  const jobsNeeded = Math.max(0, requirement.requiredCompletedJobs - completedJobs);

  return jobsNeeded > 0 ? { jobsNeeded, progress: completedJobs, required: requirement.requiredCompletedJobs } : null;
};