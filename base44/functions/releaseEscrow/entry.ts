import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Step 3 of Escrow Flow (Customer):
 * Customer approves job completion. Platform captures the held PaymentIntent,
 * triggering the transfer to the contractor minus the platform fee.
 *
 * OR customer can dispute — per platform T&C, the platform does NOT arbitrate disputes.
 * A dispute immediately cancels the PaymentIntent and refunds the customer.
 * Parties must resolve disagreements directly between themselves.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { escrow_id, action, release_notes, dispute_reason } = await req.json();

    if (!escrow_id || !action) {
      return Response.json({ error: 'escrow_id and action required' }, { status: 400 });
    }

    if (!['approve', 'dispute'].includes(action)) {
      return Response.json({ error: 'action must be "approve" or "dispute"' }, { status: 400 });
    }

    const escrow = await base44.asServiceRole.entities.EscrowPayment.get(escrow_id);
    if (!escrow) {
      return Response.json({ error: 'Escrow record not found' }, { status: 404 });
    }

    // Only the customer for this escrow can approve/dispute
    if (escrow.customer_email !== user.email) {
      return Response.json({ error: 'Forbidden: Only the customer can approve or dispute this escrow' }, { status: 403 });
    }

    // Must be in pending_release state
    if (escrow.status !== 'pending_release') {
      return Response.json({ error: `Escrow is not pending release. Current status: ${escrow.status}` }, { status: 409 });
    }

    if (!escrow.stripe_payment_intent_id) {
      return Response.json({ error: 'No PaymentIntent found for this escrow — contact support' }, { status: 500 });
    }

    // --- DISPUTE PATH ---
    // Per platform T&C: SurfCoast does not arbitrate disputes between parties.
    // A dispute immediately cancels the PaymentIntent — customer is automatically refunded.
    // Parties are directed to resolve the matter directly between themselves.
    if (action === 'dispute') {
      if (!dispute_reason?.trim()) {
        return Response.json({ error: 'dispute_reason is required when disputing' }, { status: 400 });
      }

      // Cancel the Stripe PaymentIntent — uncaptured funds are automatically returned to customer
      try {
        await stripe.paymentIntents.cancel(escrow.stripe_payment_intent_id);
        console.log(`Escrow ${escrow_id} disputed — PaymentIntent ${escrow.stripe_payment_intent_id} cancelled, customer refunded`);
      } catch (stripeErr) {
        console.error('Stripe cancel on dispute failed:', stripeErr.message);
        return Response.json({ error: 'Failed to cancel payment — please contact support' }, { status: 500 });
      }

      await base44.asServiceRole.entities.EscrowPayment.update(escrow_id, {
        status: 'refunded',
        dispute_reason: dispute_reason.trim(),
      });

      // Notify customer their refund is on the way
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: escrow.customer_email,
          from_name: 'SurfCoast Marketplace',
          subject: `Escrow Cancelled & Refund Issued — ${escrow.job_title}`,
          body: `Hi ${escrow.customer_name},

You have cancelled the escrow for "${escrow.job_title}". Your payment of $${escrow.amount.toFixed(2)} will be refunded to your original payment method within 5-10 business days.

Please note: Per our Terms & Conditions, SurfCoast Marketplace does not mediate or arbitrate disputes between customers and contractors. We encourage you to resolve any disagreements directly with ${escrow.contractor_name}.

— SurfCoast Marketplace`,
        });
      } catch (e) {
        console.warn('Failed to send refund notice to customer:', e.message);
      }

      // Notify contractor the escrow was cancelled
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: escrow.contractor_email,
          from_name: 'SurfCoast Marketplace',
          subject: `Escrow Cancelled — ${escrow.job_title}`,
          body: `Hi ${escrow.contractor_name},

The customer (${escrow.customer_name}) has cancelled the escrow for "${escrow.job_title}" and received a refund.

Reason provided: "${dispute_reason}"

Per our Terms & Conditions, SurfCoast Marketplace does not mediate or arbitrate disputes. We encourage you to resolve this matter directly with the customer.

— SurfCoast Marketplace`,
        });
      } catch (e) {
        console.warn('Failed to notify contractor of cancellation:', e.message);
      }

      return Response.json({
        success: true,
        status: 'refunded',
        message: 'Escrow cancelled. Your payment will be refunded within 5-10 business days. Per our Terms & Conditions, please resolve any disputes directly with the contractor.'
      });
    }

    // --- APPROVE PATH ---
    // Capture the held PaymentIntent — this charges the customer and triggers transfer to contractor
    let captureResult;
    try {
      captureResult = await stripe.paymentIntents.capture(escrow.stripe_payment_intent_id);
      console.log(`PaymentIntent captured: ${escrow.stripe_payment_intent_id}, status: ${captureResult.status}`);
    } catch (stripeError) {
      console.error('Stripe capture failed:', stripeError.message);

      // Handle expired authorization (Stripe holds expire after 7 days)
      if (stripeError.code === 'payment_intent_unexpected_state' || stripeError.message?.includes('capture')) {
        return Response.json({
          error: 'Payment authorization has expired. Please contact support to re-initiate the payment.',
          expired: true
        }, { status: 409 });
      }

      return Response.json({ error: 'Payment capture failed — funds have not been released' }, { status: 500 });
    }

    if (captureResult.status !== 'succeeded') {
      console.error(`Unexpected capture status: ${captureResult.status}`);
      return Response.json({ error: `Unexpected payment status: ${captureResult.status}` }, { status: 500 });
    }

    // Extract the transfer ID from the charge (created automatically via transfer_data on PaymentIntent)
    let transferId = null;
    try {
      if (captureResult.latest_charge) {
        const charge = await stripe.charges.retrieve(captureResult.latest_charge);
        transferId = charge.transfer || null;
      }
    } catch (e) {
      console.warn('Could not retrieve transfer ID from charge:', e.message);
    }

    const releasedAt = new Date().toISOString();

    // Mark escrow as released
    await base44.asServiceRole.entities.EscrowPayment.update(escrow_id, {
      status: 'released',
      released_at: releasedAt,
      release_notes: release_notes || '',
      stripe_transfer_id: transferId,
    });

    // Also update the ScopeOfWork to reflect payment complete
    try {
      await base44.asServiceRole.entities.ScopeOfWork.update(escrow.scope_id, {
        customer_closeout_confirmed: true,
      });
    } catch (e) {
      console.warn('Could not update scope closeout flag:', e.message);
    }

    // Notify contractor of payout
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.contractor_email,
        from_name: 'SurfCoast Marketplace',
        subject: `Payment Released — ${escrow.job_title} 🎉`,
        body: `Hi ${escrow.contractor_name},

Great news! The customer has approved your work and the escrowed funds have been released.

Job: ${escrow.job_title}
Amount Released: $${escrow.contractor_payout_amount?.toFixed(2)}
Platform Fee (${escrow.platform_fee_percentage}%): -$${escrow.platform_fee_amount?.toFixed(2)}
Total Charged: $${escrow.amount.toFixed(2)}

${release_notes ? `Customer's note: "${release_notes}"` : ''}

Funds will appear in your Stripe connected account within 1-2 business days.

— SurfCoast Marketplace`,
      });
    } catch (e) {
      console.warn('Failed to notify contractor of release:', e.message);
    }

    // Notify customer of confirmation
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.customer_email,
        from_name: 'SurfCoast Marketplace',
        subject: `Payment Released — ${escrow.job_title}`,
        body: `Hi ${escrow.customer_name},

You have approved the job completion for "${escrow.job_title}" and the escrowed funds have been released to ${escrow.contractor_name}.

Amount: $${escrow.amount.toFixed(2)}
Escrow ID: ${escrow_id}

Thank you for using SurfCoast Marketplace!

— SurfCoast Marketplace`,
      });
    } catch (e) {
      console.warn('Failed to send release confirmation to customer:', e.message);
    }

    console.log(`Escrow ${escrow_id} released. Capture: ${escrow.stripe_payment_intent_id}, Transfer: ${transferId}`);

    return Response.json({
      success: true,
      status: 'released',
      payoutAmount: escrow.contractor_payout_amount,
      platformFee: escrow.platform_fee_amount,
      transferId,
    });

  } catch (error) {
    console.error('releaseEscrow error:', error.message);
    return Response.json({ error: 'Failed to process escrow release' }, { status: 500 });
  }
});