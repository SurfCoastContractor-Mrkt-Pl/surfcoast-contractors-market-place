import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.0.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

Deno.serve(async (req) => {
  try {
    let stripe;
    try {
      stripe = initializeStripe();
    } catch (initErr) {
      console.error('Stripe initialization failed:', initErr.message);
      return Response.json({
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

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

    // FRAUD CHECK: Verify payment patterns before releasing funds
    const fraudCheckResp = await base44.asServiceRole.functions.invoke('fraudCheck', {
      customer_email: payment.customer_email,
      contractor_id: contractor.id,
      amount: payment.amount
    });

    if (fraudCheckResp.data?.fraud_detected) {
      console.warn(`Fraud detected for payment ${paymentId}: ${fraudCheckResp.data.reason}`);
      return Response.json(
        {
          error: fraudCheckResp.data.message,
          reason: fraudCheckResp.data.reason,
          fraud_detected: true
        },
        { status: 429 }
      );
    }

    // Calculate platform facilitation fee (3% default)
    const platformFeePercentage = payment.platform_fee_percentage || 3;
    const platformFeeAmount = (payment.amount * platformFeePercentage) / 100;
    const contractorPayoutAmount = payment.amount - platformFeeAmount;

    // Create Stripe transfer to contractor (after platform fee)
    let transferId = null;
    try {
      const transfer = await stripe.transfers.create({
        amount: Math.round(contractorPayoutAmount * 100), // Convert to cents, minus platform fee
        currency: 'usd',
        destination: contractor.stripe_connected_account_id,
        description: `Phase ${payment.phase_number} - ${payment.phase_title} for ${payment.job_id} (after ${platformFeePercentage}% platform fee)`,
        metadata: {
          progress_payment_id: paymentId,
          scope_id: payment.scope_id,
          app_id: Deno.env.get('BASE44_APP_ID'),
          platform_fee_amount: platformFeeAmount.toFixed(2),
          platform_fee_percentage: platformFeePercentage
        }
      });
      transferId = transfer.id;
      console.log(`Stripe transfer created: ${transferId} for $${contractorPayoutAmount} (after ${platformFeePercentage}% fee = $${platformFeeAmount}) to contractor ${contractor.id}`);
    } catch (stripeError) {
      console.error('Stripe transfer failed');
      return Response.json({
        error: 'Payment processing failed',
        stripeError: true
      }, { status: 500 });
    }

    // Mark payment as paid with Stripe reference and fee tracking
    const approvedAt = new Date().toISOString();
    const updated = await base44.asServiceRole.entities.ProgressPayment.update(paymentId, {
      status: 'paid',
      customer_approved_date: approvedAt,
      customer_approval_notes: approvalNotes || '',
      paid_date: approvedAt,
      stripe_payout_id: transferId,
      platform_fee_percentage: platformFeePercentage,
      platform_fee_amount: platformFeeAmount,
      contractor_payout_amount: contractorPayoutAmount
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
      console.error('Invoice generation failed (non-fatal)');
    }

    return Response.json({
      success: true,
      payment: updated,
      invoiceUrl,
      invoiceNumber,
      payoutId: transferId
    });
  } catch (error) {
    console.error('Error in releaseProgressPayment');
    return Response.json({ error: 'Failed to release payment' }, { status: 500 });
  }
});