import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function
    if (!user || user.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    const {
      dispute_id,
      resolution_type,
      resolution_details,
      admin_notes
    } = await req.json();

    if (!dispute_id || !resolution_type) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Fetch dispute
    const disputes = await base44.asServiceRole.entities.Dispute.filter({
      id: dispute_id
    });

    if (!disputes || disputes.length === 0) {
      return Response.json(
        { error: 'Dispute not found' },
        { status: 404 }
      );
    }

    const dispute = disputes[0];

    // Update dispute with resolution
    await base44.asServiceRole.entities.Dispute.update(dispute_id, {
      status: 'resolved',
      resolution_type,
      resolution_details: resolution_details || null,
      admin_notes: admin_notes || null,
      assigned_to_admin: user.email,
      resolved_at: new Date().toISOString()
    });

    // If refund issued, handle payment refunds
    if (resolution_type === 'refund_issued' && dispute.scope_id) {
      const payments = await base44.asServiceRole.entities.ProgressPayment.filter({
        scope_id: dispute.scope_id,
        status: 'paid'
      });

      for (const payment of payments || []) {
        await base44.asServiceRole.entities.ProgressPayment.update(payment.id, {
          status: 'cancelled'
        });
      }
    }

    // If work remedied, resume paused payments
    if (resolution_type === 'work_remedied' && dispute.scope_id) {
      const payments = await base44.asServiceRole.entities.ProgressPayment.filter({
        scope_id: dispute.scope_id,
        status: 'pending'
      });

      for (const payment of payments || []) {
        await base44.asServiceRole.entities.ProgressPayment.update(payment.id, {
          status: 'contractor_completed'
        });
      }
    }

    // Notify both parties of resolution
    const emailSubject = `Dispute Resolution: ${dispute.title}`;
    const emailBody = `
Your dispute has been reviewed and resolved.

**Resolution Type:** ${resolution_type.replace(/_/g, ' ')}

**Resolution Details:**
${resolution_details || 'No additional details provided'}

**Admin Notes:**
${admin_notes || 'No notes'}

If you have questions, please contact our support team.
    `.trim();

    const emailPromises = [];
    if (dispute.initiator_email) {
      emailPromises.push(base44.asServiceRole.integrations.Core.SendEmail({
        to: dispute.initiator_email,
        subject: emailSubject,
        body: emailBody
      }));
    }
    if (dispute.respondent_email) {
      emailPromises.push(base44.asServiceRole.integrations.Core.SendEmail({
        to: dispute.respondent_email,
        subject: emailSubject,
        body: emailBody
      }));
    }
    await Promise.all(emailPromises);

    return Response.json({
      success: true,
      message: 'Dispute resolved and parties notified'
    });
  } catch (error) {
    console.error('Dispute resolution error:', error.message);
    return Response.json(
      { error: 'Failed to resolve dispute', details: error.message },
      { status: 500 }
    );
  }
});