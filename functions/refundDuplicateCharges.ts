import Stripe from 'npm:stripe@16.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    // Admin-only function
    const user = await base44.auth.me();
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { customer_email, amount_cents = 175 } = body; // $1.75 = 175 cents

    if (!customer_email) {
      return Response.json({ error: 'Missing customer_email' }, { status: 400 });
    }

    // Find all charges for this customer email
    const charges = await stripe.charges.list({
      limit: 100,
    });

    const matchingCharges = charges.data.filter(charge => 
      charge.billing_details?.email === customer_email &&
      charge.amount === amount_cents &&
      (charge.status === 'succeeded' || charge.status === 'pending')
    );

    console.log(`Found ${matchingCharges.length} charges for ${customer_email}`);

    const refunded = [];
    const errors = [];

    // Refund duplicates (keep first, refund rest)
    for (let i = 1; i < matchingCharges.length; i++) {
      try {
        const refund = await stripe.refunds.create({
          charge: matchingCharges[i].id,
          reason: 'duplicate',
        });
        refunded.push({
          chargeId: matchingCharges[i].id,
          refundId: refund.id,
          amount: matchingCharges[i].amount / 100,
        });
        console.log(`Refunded charge ${matchingCharges[i].id}`);
      } catch (err) {
        errors.push({
          chargeId: matchingCharges[i].id,
          error: err.message,
        });
        console.error(`Failed to refund ${matchingCharges[i].id}:`, err.message);
      }
    }

    return Response.json({
      success: true,
      customer_email,
      total_charges_found: matchingCharges.length,
      refunded: refunded,
      errors: errors,
      message: `Found ${matchingCharges.length} charges. Refunded ${refunded.length} duplicates.`,
    });
  } catch (error) {
    console.error('refundDuplicateCharges error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});