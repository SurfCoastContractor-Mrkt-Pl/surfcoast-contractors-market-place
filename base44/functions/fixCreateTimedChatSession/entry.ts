import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { sender_email, recipient_email, duration_minutes = 10, payment_id } = await req.json();

    // Ensure the authenticated user matches the sender
    if (user.email !== sender_email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (!sender_email || !recipient_email) {
      return Response.json({ error: 'sender_email and recipient_email required' }, { status: 400 });
    }

    // Validate payment exists if not a subscriber
    if (!payment_id) {
      return Response.json({ 
        error: 'Payment required for messaging', 
        requires_payment: true,
        cost: '$1.50 for 10 minutes or $50/month unlimited'
      }, { status: 402 });
    }

    const session_id = `chat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const expires_at = new Date(Date.now() + duration_minutes * 60 * 1000).toISOString();

    return Response.json({
      session_id,
      sender_email,
      recipient_email,
      duration_minutes,
      expires_at,
      status: 'active',
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});