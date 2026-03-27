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