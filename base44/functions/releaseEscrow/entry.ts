import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Step 3 of Escrow Flow (Customer):
 * Customer approves job completion. Platform captures the held PaymentIntent,
 * triggering the transfer to the contractor minus the platform fee.
 * 
 * OR customer can dispute, freezing funds for admin review.
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
    if (action === 'dispute') {
      if (!dispute_reason?.trim()) {
        return Response.json({ error: 'dispute_reason is required when disputing' }, { status: 400 });
      }

      await base44.asServiceRole.entities.EscrowPayment.update(escrow_id, {
        status: 'disputed',
        dispute_reason: dispute_reason.trim(),
      });

      // Alert admin
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            from_name: 'SurfCoast Escrow System',
            subject: `[ESCROW DISPUTE] ${escrow.job_title} — $${escrow.amount.toFixed(2)}`,
            body: `An escrow payment has been disputed and requires admin review.

Escrow ID: ${escrow_id}
Job: ${escrow.job_title}
Amount: $${escrow.amount.toFixed(2)}
Customer: ${escrow.customer_name} (${escrow.customer_email})
Contractor: ${escrow.contractor_name} (${escrow.contractor_email})

Dispute Reason:
"${dispute_reason}"

Stripe PaymentIntent: ${escrow.stripe_payment_intent_id}

Please review and resolve this dispute in the Admin Dashboard.`,
          });
        } catch (e) {
          console.warn('Failed to send dispute alert to admin:', e.message);
        }
      }

      // Notify both parties
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: escrow.contractor_email,
          from_name: 'SurfCoast Marketplace',
          subject: `Escrow Disputed — ${escrow.job_title}`,
          body: `Hi ${escrow.contractor_name},\n\nThe customer has filed a dispute for the escrow payment on "${escrow.job_title}".\n\nFunds will remain held until an admin reviews and resolves the dispute. You will be notified of the outcome.\n\nDispute reason: "${dispute_reason}"\n\n— SurfCoast Marketplace`,
        });
      } catch (e) {
        console.warn('Failed to notify contractor of dispute:', e.message);
      }

      console.log(`Escrow ${escrow_id} disputed by customer ${user.email}`);
      return Response.json({ success: true, status: 'disputed', message: 'Dispute filed. Admin team has been notified.' });
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