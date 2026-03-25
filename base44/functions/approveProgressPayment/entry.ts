import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentId, completionNotes, photoUrls } = await req.json();

    if (!paymentId) {
      return Response.json({ error: 'paymentId required' }, { status: 400 });
    }

    // Fetch the payment
    const payments = await base44.asServiceRole.entities.ProgressPayment.filter({ id: paymentId });
    const payment = payments[0];

    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify contractor is marking their own phase complete
    if (payment.contractor_email !== user.email) {
      return Response.json({ error: 'Only the contractor can mark phases complete' }, { status: 403 });
    }

    if (payment.status !== 'pending') {
      return Response.json({ error: 'Phase is not in pending status' }, { status: 400 });
    }

    // Update payment to contractor_completed using user-level access to enforce RLS
    const updated = await base44.entities.ProgressPayment.update(paymentId, {
      status: 'contractor_completed',
      contractor_completed_date: new Date().toISOString(),
      contractor_completion_notes: completionNotes || '',
      completion_photo_urls: photoUrls || []
    });

    console.log(`Phase ${payment.phase_number} marked complete for scope ${payment.scope_id}`);

    return Response.json({ success: true, payment: updated });
  } catch (error) {
    console.error('Error in approveProgressPayment:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});