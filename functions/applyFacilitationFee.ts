import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { user_email, user_type, transaction_amount } = await req.json();

    if (!user_email || !user_type || !transaction_amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is an early adopter with active waiver
    const waivers = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({
      user_email: user_email,
      is_eligible: true
    });

    const now = new Date();
    let facilitation_fee_percentage = user_type === 'contractor' ? 18 : 18;
    let is_waived = false;
    let fee_reason = 'standard_pricing';

    if (waivers && waivers.length > 0) {
      const waiver = waivers[0];
      const freeYearExpires = new Date(waiver.free_year_expires_at);

      // Still in free year
      if (now < freeYearExpires) {
        facilitation_fee_percentage = 0;
        is_waived = true;
        fee_reason = 'early_adopter_free_year';
      } 
      // Free year expired - apply post-free-year rates
      else if (waiver.waiver_status === 'approved') {
        // Mark waiver as expired
        await base44.asServiceRole.entities.EarlyAdopterWaiver.update(waiver.id, {
          waiver_status: 'expired'
        });

        if (user_type === 'contractor') {
          // Contractors get 8% indefinitely
          facilitation_fee_percentage = 8;
          fee_reason = 'early_adopter_contractor_lifetime_8_percent';
        } else {
          // Customers revert to standard pricing
          facilitation_fee_percentage = 18;
          fee_reason = 'early_adopter_customer_standard_after_year';
        }
      }
    }

    const fee_amount = (transaction_amount * facilitation_fee_percentage) / 100;
    const payout_amount = transaction_amount - fee_amount;

    return Response.json({
      transaction_amount,
      facilitation_fee_percentage,
      facilitation_fee_amount: fee_amount,
      payout_amount,
      is_waived,
      fee_reason,
      user_type,
      applied_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error calculating facilitation fee:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});