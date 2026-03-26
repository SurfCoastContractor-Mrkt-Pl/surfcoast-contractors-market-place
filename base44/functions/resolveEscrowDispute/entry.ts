import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Admin-only: Resolve a disputed escrow by either:
 * - "release" → capture and pay contractor (admin sides with contractor)
 * - "refund"  → cancel the PaymentIntent, return funds to customer
 * - "split"   → capture and transfer partial amount to contractor, refund rest to customer
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { escrow_id, resolution, admin_notes, split_contractor_amount } = await req.json();

    if (!escrow_id || !resolution) {
      return Response.json({ error: 'escrow_id and resolution required' }, { status: 400 });
    }

    if (!['release', 'refund', 'split'].includes(resolution)) {
      return Response.json({ error: 'resolution must be "release", "refund", or "split"' }, { status: 400 });
    }

    const escrow = await base44.asServiceRole.entities.EscrowPayment.get(escrow_id);
    if (!escrow) {
      return Response.json({ error: 'Escrow not found' }, { status: 404 });
    }

    if (escrow.status !== 'disputed') {
      return Response.json({ error: `Escrow is not in disputed state. Current: ${escrow.status}` }, { status: 409 });
    }

    if (!escrow.stripe_payment_intent_id) {
      return Response.json({ error: 'No Stripe PaymentIntent found for this escrow' }, { status: 500 });
    }

    let finalStatus;
    let transferId = null;

    if (resolution === 'refund') {
      // Cancel the PaymentIntent — uncaptured funds return to customer automatically
      try {
        await stripe.paymentIntents.cancel(escrow.stripe_payment_intent_id);
        console.log(`PaymentIntent ${escrow.stripe_payment_intent_id} cancelled — refund to customer`);
      } catch (e) {
        console.error('Stripe cancel failed:', e.message);
        return Response.json({ error: 'Stripe refund failed' }, { status: 500 });
      }
      finalStatus = 'refunded';

    } else if (resolution === 'release') {
      // Full capture → contractor gets paid
      try {
        const captured = await stripe.paymentIntents.capture(escrow.stripe_payment_intent_id);
        if (captured.latest_charge) {
          const charge = await stripe.charges.retrieve(captured.latest_charge);
          transferId = charge.transfer || null;
        }
        console.log(`PaymentIntent ${escrow.stripe_payment_intent_id} captured for contractor`);
      } catch (e) {
        console.error('Stripe capture failed:', e.message);
        return Response.json({ error: 'Stripe capture failed' }, { status: 500 });
      }
      finalStatus = 'released';

    } else if (resolution === 'split') {
      // Partial capture: admin specifies contractor amount, rest goes back
      if (!split_contractor_amount || split_contractor_amount <= 0 || split_contractor_amount >= escrow.amount) {
        return Response.json({ error: 'split_contractor_amount must be a positive amount less than the total' }, { status: 400 });
      }
      const contractorCents = Math.round(split_contractor_amount * 100);
      try {
        // Capture only the contractor's portion
        const captured = await stripe.paymentIntents.capture(escrow.stripe_payment_intent_id, {
          amount_to_capture: contractorCents,
        });
        if (captured.latest_charge) {
          const charge = await stripe.charges.retrieve(captured.latest_charge);
          transferId = charge.transfer || null;
        }
        console.log(`PaymentIntent partially captured: $${split_contractor_amount} for contractor`);
      } catch (e) {
        console.error('Stripe partial capture failed:', e.message);
        return Response.json({ error: 'Stripe partial capture failed' }, { status: 500 });
      }
      finalStatus = 'released';
    }

    // Update escrow record
    await base44.asServiceRole.entities.EscrowPayment.update(escrow_id, {
      status: finalStatus,
      admin_resolution: `[${resolution.toUpperCase()}] ${admin_notes || ''}`.trim(),
      released_at: finalStatus === 'released' ? new Date().toISOString() : undefined,
      stripe_transfer_id: transferId,
    });

    // Notify both parties
    const resolutionText = {
      release: 'Funds have been released to the contractor.',
      refund: 'Funds have been refunded to the customer.',
      split: `Funds have been split: $${split_contractor_amount?.toFixed(2)} to contractor, remainder refunded to customer.`,
    }[resolution];

    const emailBody = (name) => `Hi ${name},\n\nThe disputed escrow for "${escrow.job_title}" has been resolved by the SurfCoast admin team.\n\nResolution: ${resolutionText}\n${admin_notes ? `\nAdmin notes: "${admin_notes}"` : ''}\n\n— SurfCoast Marketplace`;

    await Promise.all([
      base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.customer_email,
        from_name: 'SurfCoast Marketplace',
        subject: `Escrow Dispute Resolved — ${escrow.job_title}`,
        body: emailBody(escrow.customer_name),
      }).catch(e => console.warn('Customer notify failed:', e.message)),
      base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.contractor_email,
        from_name: 'SurfCoast Marketplace',
        subject: `Escrow Dispute Resolved — ${escrow.job_title}`,
        body: emailBody(escrow.contractor_name),
      }).catch(e => console.warn('Contractor notify failed:', e.message)),
    ]);

    console.log(`Escrow ${escrow_id} dispute resolved: ${resolution} by admin ${user.email}`);

    return Response.json({ success: true, resolution, finalStatus, transferId });

  } catch (error) {
    console.error('resolveEscrowDispute error:', error.message);
    return Response.json({ error: 'Failed to resolve escrow dispute' }, { status: 500 });
  }
});