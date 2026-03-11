import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId } = await req.json();

    if (!paymentId) {
      return Response.json({ error: 'paymentId required' }, { status: 400 });
    }

    // Fetch payment
    const payments = await base44.asServiceRole.entities.ProgressPayment.filter({ id: paymentId });
    const payment = payments[0];

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify customer approved
    if (payment.status !== 'customer_approved') {
      return Response.json({ error: 'Payment must be customer-approved before payout' }, { status: 400 });
    }

    // Verify user is customer
    if (payment.customer_email !== user.email) {
      return Response.json({ error: 'Only customer can release payment' }, { status: 403 });
    }

    // Get contractor Stripe account
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: payment.contractor_email
    });
    const contractor = contractors[0];

    if (!contractor?.stripe_connected_account_id) {
      return Response.json({ error: 'Contractor has not set up Stripe payouts' }, { status: 400 });
    }

    // Create transfer to contractor's Stripe account
    const transfer = await stripe.transfers.create({
      amount: Math.round(payment.amount * 100), // Amount in cents
      currency: 'usd',
      destination: contractor.stripe_connected_account_id,
      description: `Phase ${payment.phase_number} payout for scope ${payment.scope_id}`,
      metadata: {
        payment_id: paymentId,
        app_id: Deno.env.get('BASE44_APP_ID')
      }
    });

    // Update payment status to paid
    await base44.asServiceRole.entities.ProgressPayment.update(paymentId, {
      status: 'paid',
      paid_date: new Date().toISOString(),
      stripe_payout_id: transfer.id
    });

    console.log(`Payout released: $${payment.amount} to contractor ${contractor.id} via transfer ${transfer.id}`);

    return Response.json({
      success: true,
      transferId: transfer.id,
      amount: payment.amount
    });
  } catch (error) {
    console.error('Error in releaseProgressPaymentPayout:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});