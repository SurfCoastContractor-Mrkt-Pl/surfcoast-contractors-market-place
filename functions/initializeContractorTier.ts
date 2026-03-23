import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    // Validate internal service key OR authenticated admin session
    const internalKey = req.headers.get('x-internal-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');

    const base44 = createClientFromRequest(req);

    if (internalKey !== expectedKey) {
      // Fall back to checking authenticated admin user
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { contractorId, contractorEmail } = await req.json();

    if (!contractorId || !contractorEmail) {
      return Response.json(
        { error: 'Missing contractorId or contractorEmail' },
        { status: 400 }
      );
    }

    const currentYear = new Date().getFullYear();

    // Check if tier record already exists
    const existingTiers = await base44.asServiceRole.entities.ContractorTier.filter({
      contractor_id: contractorId,
      year: currentYear
    });

    if (existingTiers && existingTiers.length > 0) {
      return Response.json({
        success: true,
        message: 'Tier record already exists',
        tier: existingTiers[0]
      });
    }

    // Create new tier record
    const tierRecord = await base44.asServiceRole.entities.ContractorTier.create({
      contractor_id: contractorId,
      contractor_email: contractorEmail,
      current_tier: 'bronze',
      annual_earnings: 0,
      lifetime_earnings: 0,
      current_facilitation_fee: 2,
      year: currentYear,
      earnings_to_next_tier: 1500000,
      next_tier_earnings_needed: 1500000
    });

    console.log(`Contractor tier initialized for ${contractorEmail}`);

    return Response.json({
      success: true,
      message: 'Tier record created successfully',
      tier: tierRecord
    });
  } catch (error) {
    console.error('Initialize tier error:', error);
    return Response.json(
      { error: error.message || 'Failed to initialize tier' },
      { status: 500 }
    );
  }
});