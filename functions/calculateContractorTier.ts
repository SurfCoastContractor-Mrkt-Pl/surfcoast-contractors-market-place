import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Tier thresholds and fees
const TIER_CONFIG = {
  bronze: { minEarnings: 0, maxEarnings: 1500000, fee: 2, label: 'Bronze' },
  silver: { minEarnings: 1500000, maxEarnings: 5000000, fee: 10, label: 'Silver' },
  gold: { minEarnings: 5000000, maxEarnings: Infinity, fee: 15, label: 'Gold' }
};

const calculateTier = (annualEarnings) => {
  if (annualEarnings < 1500000) return 'bronze';
  if (annualEarnings < 5000000) return 'silver';
  return 'gold';
};

const getNextTierThreshold = (currentTier) => {
  if (currentTier === 'bronze') return 1500000;
  if (currentTier === 'silver') return 5000000;
  return Infinity;
};

Deno.serve(async (req) => {
  try {
    // Validate internal service key
    const internalKey = req.headers.get('x-internal-key');
    if (internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const base44 = createClientFromRequest(req);
    const { contractorId, contractorEmail, payoutAmount } = await req.json();

    if (!contractorId || !contractorEmail || payoutAmount === undefined) {
      return Response.json(
        { error: 'Missing required fields: contractorId, contractorEmail, payoutAmount' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();

    // Get or create contractor tier record
    let tierRecords = await base44.asServiceRole.entities.ContractorTier.filter({
      contractor_id: contractorId,
      year: currentYear
    });

    let tierRecord = tierRecords?.[0];

    if (!tierRecord) {
      // Create new tier record for this year
      tierRecord = await base44.asServiceRole.entities.ContractorTier.create({
        contractor_id: contractorId,
        contractor_email: contractorEmail,
        current_tier: 'bronze',
        annual_earnings: payoutAmount,
        lifetime_earnings: payoutAmount,
        current_facilitation_fee: 2,
        year: currentYear
      });
    } else {
      // Update annual earnings
      const newAnnualEarnings = tierRecord.annual_earnings + payoutAmount;
      const newTier = calculateTier(newAnnualEarnings);
      const previousTier = tierRecord.current_tier;

      const updateData = {
        annual_earnings: newAnnualEarnings,
        lifetime_earnings: tierRecord.lifetime_earnings + payoutAmount,
        current_tier: newTier,
        current_facilitation_fee: TIER_CONFIG[newTier].fee
      };

      // Track tier change
      if (newTier !== previousTier) {
        updateData.previous_tier = previousTier;
        updateData.tier_changed_at = new Date().toISOString();
      }

      // Calculate earnings to next tier
      const nextThreshold = getNextTierThreshold(newTier);
      updateData.earnings_to_next_tier = Math.max(0, nextThreshold - newAnnualEarnings);
      updateData.next_tier_earnings_needed = nextThreshold;

      tierRecord = await base44.asServiceRole.entities.ContractorTier.update(
        tierRecord.id,
        updateData
      );

      console.log(`Tier calculated for ${contractorEmail}: ${newTier} (${newAnnualEarnings / 100})`);
    }

    return Response.json({
      success: true,
      tier: tierRecord.current_tier,
      fee: tierRecord.current_facilitation_fee,
      annualEarnings: tierRecord.annual_earnings,
      earnedToNextTier: tierRecord.earnings_to_next_tier
    });
  } catch (error) {
    console.error('Calculate tier error:', error);
    return Response.json(
      { error: error.message || 'Failed to calculate tier' },
      { status: 500 }
    );
  }
});