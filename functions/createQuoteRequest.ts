import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();
    const { payment_id, contractor_id, contractor_name, contractor_email, customer_email, customer_name, work_description, job_id, job_title } = body;

    if (!payment_id || !contractor_id || !contractor_email || !customer_email || !work_description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the payment exists and is confirmed
    const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
    if (!payments || payments.length === 0) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }
    if (payments[0].status !== 'confirmed') {
      return Response.json({ error: 'Payment not confirmed' }, { status: 402 });
    }

    // Idempotency: don't create duplicate
    const existing = await base44.asServiceRole.entities.QuoteRequest.filter({ payment_id });
    if (existing.length > 0) {
      return Response.json({ success: true, quote: existing[0], duplicate: true });
    }

    const quote = await base44.asServiceRole.entities.QuoteRequest.create({
      contractor_id,
      contractor_name,
      contractor_email,
      customer_email,
      customer_name,
      work_description,
      payment_id,
      created_at: new Date().toISOString(),
      response_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    });

    return Response.json({ success: true, quote });
  } catch (error) {
    console.error('createQuoteRequest error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});