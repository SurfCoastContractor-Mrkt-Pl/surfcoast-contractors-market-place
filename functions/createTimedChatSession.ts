import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { payment_id, contractor_id, contractor_name, contractor_email, customer_email, customer_name } = await req.json();

    if (!payment_id || !contractor_email || !customer_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify payment is confirmed
    const payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    if (!payment || payment.status !== 'confirmed') {
      return Response.json({ error: 'Payment not confirmed' }, { status: 402 });
    }

    // Create session record
    const session = await base44.asServiceRole.entities.TimedChatSession.create({
      payment_id,
      contractor_id: contractor_id || '',
      contractor_name: contractor_name || '',
      contractor_email,
      customer_email,
      customer_name: customer_name || '',
      started_at: new Date().toISOString(),
      expires_at: null,
      status: 'active',
      total_seconds_used: 0,
      last_activity_at: new Date().toISOString(),
    });

    return Response.json({ session }, { status: 200 });
  } catch (error) {
    console.error('Error creating timed chat session:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});