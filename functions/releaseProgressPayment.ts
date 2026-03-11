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

    const { paymentId, approvalNotes } = await req.json();

    if (!paymentId) {
      return Response.json({ error: 'paymentId required' }, { status: 400 });
    }

    // Fetch the payment
    const payments = await base44.asServiceRole.entities.ProgressPayment.filter({ id: paymentId });
    const payment = payments[0];

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify customer is approving
    if (payment.customer_email !== user.email) {
      return Response.json({ error: 'Only the customer can approve and release payments' }, { status: 403 });
    }

    if (payment.status !== 'contractor_completed') {
      return Response.json({ error: 'Phase must be marked complete by contractor first' }, { status: 400 });
    }

    // Get contractor Stripe Connect account
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: payment.contractor_email
    });
    const contractor = contractors[0];

    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    if (!contractor.stripe_connected_account_id || !contractor.stripe_account_charges_enabled) {
      return Response.json({
        error: 'Contractor has not completed Stripe payout setup. Contact support or the contractor to resolve.',
        missingPayoutSetup: true
      }, { status: 400 });
    }

    // Create Stripe transfer to contractor
    let transferId = null;
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(payment.amount * 100), // Convert to cents
        currency: 'usd',
        destination: contractor.stripe_connected_account_id,
        description: `Phase ${payment.phase_number} - ${payment.phase_title} for ${payment.job_id}`,
        metadata: {
          progress_payment_id: paymentId,
          scope_id: payment.scope_id,
          app_id: Deno.env.get('BASE44_APP_ID')
        }
      });
      transferId = transfer.id;
      console.log(`Stripe transfer created: ${transferId} for $${payment.amount} to contractor ${contractor.id}`);
    } catch (stripeError) {
      console.error('Stripe transfer failed:', stripeError.message);
      return Response.json({
        error: `Payment processing failed: ${stripeError.message}`,
        stripeError: true
      }, { status: 500 });
    }

    // Mark payment as paid with Stripe reference
    const approvedAt = new Date().toISOString();
    const updated = await base44.asServiceRole.entities.ProgressPayment.update(paymentId, {
      status: 'paid',
      customer_approved_date: approvedAt,
      customer_approval_notes: approvalNotes || '',
      paid_date: approvedAt,
      stripe_payout_id: transferId
    });

    console.log(`Phase ${payment.phase_number} approved and payout released for scope ${payment.scope_id}`);

    // Auto-generate phase invoice
    let invoiceUrl = null;
    let invoiceNumber = null;
    try {
      const invoiceResp = await base44.functions.invoke('generatePhaseInvoice', { progressPaymentId: paymentId });
      const invoiceData = invoiceResp?.data || invoiceResp;
      invoiceUrl = invoiceData?.pdfUrl || null;
      invoiceNumber = invoiceData?.invoiceNumber || null;
      console.log(`Invoice generated: ${invoiceNumber} — ${invoiceUrl}`);
    } catch (invoiceError) {
      console.error('Invoice generation failed (non-fatal):', invoiceError.message);
    }

    return Response.json({
      success: true,
      payment: updated,
      invoiceUrl,
      invoiceNumber,
      payoutId: transferId
    });
  } catch (error) {
    console.error('Error in releaseProgressPayment:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});