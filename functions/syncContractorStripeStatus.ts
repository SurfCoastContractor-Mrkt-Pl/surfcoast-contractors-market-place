import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractor_id } = await req.json();
    if (!contractor_id) {
      return Response.json({ error: 'contractor_id required' }, { status: 400 });
    }

    const contractors = await base44.entities.Contractor.filter({ email: user.email });
    const contractor = contractors?.[0];

    if (!contractor || contractor.id !== contractor_id) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (!contractor.stripe_connected_account_id) {
      return Response.json({ charges_enabled: false, payouts_enabled: false });
    }

    const account = await stripe.accounts.retrieve(contractor.stripe_connected_account_id);

    const charges_enabled = account.charges_enabled ?? false;
    const payouts_enabled = account.payouts_enabled ?? false;

    await base44.entities.Contractor.update(contractor.id, {
      stripe_account_charges_enabled: charges_enabled,
      stripe_account_setup_complete: charges_enabled,
    });

    return Response.json({ charges_enabled, payouts_enabled });
  } catch (error) {
    console.error('syncContractorStripeStatus error:', error.message);
    return Response.json({ error: 'Failed to sync Stripe status' }, { status: 500 });
  }
});