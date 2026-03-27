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
  },
  licensed: {
    maxServices: 50,
    maxServicePackages: 5,
    pdfTemplates: ['basic', 'professional'],
    emailCustomization: true,
    emailTracking: false,
    serviceCategories: ['electrical', 'plumbing', 'hvac', 'carpentry', 'roofing', 'painting', 'landscaping', 'masonry', 'welding', 'tiling', 'general_labor', 'consulting'],
    advancedAnalytics: false,
  },
  premium: {
    maxServices: -1, // unlimited
    maxServicePackages: -1, // unlimited
    pdfTemplates: ['basic', 'professional', 'premium', 'custom'],
    emailCustomization: true,
    emailTracking: true,
    serviceCategories: '*', // all
    advancedAnalytics: true,
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