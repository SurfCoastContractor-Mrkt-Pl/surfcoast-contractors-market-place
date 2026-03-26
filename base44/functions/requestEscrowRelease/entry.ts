import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Step 2 of Escrow Flow (Contractor):
 * Contractor marks job as complete and requests fund release.
 * Customer is notified to review and approve.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { escrow_id, completion_notes, completion_photo_urls } = await req.json();

    if (!escrow_id) {
      return Response.json({ error: 'escrow_id required' }, { status: 400 });
    }

    const escrow = await base44.asServiceRole.entities.EscrowPayment.get(escrow_id);
    if (!escrow) {
      return Response.json({ error: 'Escrow record not found' }, { status: 404 });
    }

    // Only the contractor for this escrow can request release
    if (escrow.contractor_email !== user.email) {
      return Response.json({ error: 'Forbidden: Only the contractor can request release' }, { status: 403 });
    }

    // Escrow must be funded (customer has paid)
    if (!['funded', 'work_in_progress'].includes(escrow.status)) {
      return Response.json({ error: `Escrow must be funded before requesting release. Current status: ${escrow.status}` }, { status: 409 });
    }

    // Update escrow to pending_release
    await base44.asServiceRole.entities.EscrowPayment.update(escrow_id, {
      status: 'pending_release',
      completion_requested_at: new Date().toISOString(),
      completion_notes: completion_notes || '',
      completion_photo_urls: completion_photo_urls || [],
    });

    // Notify customer to review and approve
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.customer_email,
        from_name: 'SurfCoast Marketplace',
        subject: `Action Required: Approve Job Completion — ${escrow.job_title}`,
        body: `Hi ${escrow.customer_name},

Your contractor ${escrow.contractor_name} has marked the job "${escrow.job_title}" as complete and is requesting release of the escrowed funds ($${escrow.amount.toFixed(2)}).

${completion_notes ? `Contractor's notes:\n"${completion_notes}"\n` : ''}
Please log in to your account to review the completed work and either:
✅ APPROVE — Release $${escrow.contractor_payout_amount?.toFixed(2)} to the contractor
❌ CANCEL ESCROW — Dispute the work and receive a full refund

Important: Per our Terms & Conditions, SurfCoast does not mediate disputes. If you cancel the escrow, you will be automatically refunded and must resolve any disagreements directly with the contractor.

If you do not respond within 7 days, funds will be automatically released to the contractor.

Escrow ID: ${escrow_id}

— SurfCoast Marketplace`,
      });
    } catch (emailErr) {
      console.warn('Failed to send completion notification to customer:', emailErr.message);
    }

    // Notify contractor that request was submitted
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.contractor_email,
        from_name: 'SurfCoast Marketplace',
        subject: `Release Request Submitted — ${escrow.job_title}`,
        body: `Hi ${escrow.contractor_name},

Your request to release escrowed funds for "${escrow.job_title}" has been submitted.

The customer (${escrow.customer_name}) has been notified to review and approve. You will be notified once the funds are released.

Expected payout: $${escrow.contractor_payout_amount?.toFixed(2)} (after ${escrow.platform_fee_percentage}% platform fee)

— SurfCoast Marketplace`,
      });
    } catch (emailErr) {
      console.warn('Failed to send confirmation to contractor:', emailErr.message);
    }

    console.log(`Escrow release requested: ${escrow_id} by contractor ${user.email}`);

    return Response.json({ success: true, message: 'Release request submitted. Customer has been notified.' });

  } catch (error) {
    console.error('requestEscrowRelease error:', error.message);
    return Response.json({ error: 'Failed to request escrow release' }, { status: 500 });
  }
});