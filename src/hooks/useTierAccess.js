import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { getTierFeatures, canAccessFeature } from '@/lib/tierConfig';

export default function useTierAccess(userEmail) {
  const [contractor, setContractor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tierFeatures, setTierFeatures] = useState(null);

  useEffect(() => {
    const fetchContractorTier = async () => {
      if (!userEmail) {
        setLoading(false);
        return;
      }
      try {
        const contractors = await base44.entities.Contractor.filter({ email: userEmail }, '', 1);
        if (contractors.length > 0) {
          const contractorData = contractors[0];
          setContractor(contractorData);
          setTierFeatures(getTierFeatures(contractorData.profile_tier));
        }
      } catch (error) {
        console.error('Error fetching contractor tier:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContractorTier();
  }, [userEmail]);

  const hasFeature = (feature, currentValue = 0) => {
    if (!contractor) return false;
    return canAccessFeature(contractor.profile_tier, feature, currentValue);
  };

  const getFeatureLimit = (feature) => {
    if (!tierFeatures) return 0;
    return tierFeatures[feature] || 0;
  };

  return {
    contractor,
    tierFeatures,
    loading,
    hasFeature,
    getFeatureLimit,
    profileTier: contractor?.profile_tier,
  };
}