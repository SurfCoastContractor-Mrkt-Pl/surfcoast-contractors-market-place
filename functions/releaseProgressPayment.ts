import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

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

    // For now, update status to customer_approved
    // In production, this would integrate with Stripe Connect to release funds
    const updated = await base44.asServiceRole.entities.ProgressPayment.update(paymentId, {
      status: 'customer_approved',
      customer_approved_date: new Date().toISOString(),
      customer_approval_notes: approvalNotes || '',
      paid_date: new Date().toISOString()
    });

    console.log(`Phase ${payment.phase_number} approved and marked paid for scope ${payment.scope_id}`);

    return Response.json({ success: true, payment: updated });
  } catch (error) {
    console.error('Error in releaseProgressPayment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});