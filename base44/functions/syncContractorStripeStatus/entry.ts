import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractor_id } = await req.json();

    if (!contractor_id) {
      return Response.json({ error: 'contractor_id required' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);

    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    // Verify user owns this contractor
    if (contractor.email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: You do not own this contractor profile' }, { status: 403 });
    }

    if (!contractor.stripe_connected_account_id) {
      return Response.json({ ok: true, charges_enabled: false, payouts_enabled: false, payout_ready: false });
    }

    const account = await stripe.accounts.retrieve(contractor.stripe_connected_account_id);

    const charges_enabled = account.charges_enabled ?? false;
    const payouts_enabled = account.payouts_enabled ?? false;
    const payout_ready = charges_enabled && payouts_enabled;

    await base44.asServiceRole.entities.Contractor.update(contractor_id, {
      stripe_account_charges_enabled: charges_enabled,
      stripe_account_setup_complete: charges_enabled,
    });

    return Response.json({ ok: true, charges_enabled, payouts_enabled, payout_ready });
  } catch (err) {
    console.error('syncContractorStripeStatus error:', err.message);
    return Response.json({ error: err.message || String(err) }, { status: 500 });
  }
});