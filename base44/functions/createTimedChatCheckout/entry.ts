import Stripe from 'npm:stripe@14.21.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const { initiatorEmail, initiatorName, recipientEmail, recipientName, idempotencyKey } = await req.json();

    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized: User must be logged in' }, { status: 401 });
    }

    // Verify initiatorEmail matches authenticated user
    if (initiatorEmail !== user.email) {
      return Response.json({ error: 'Unauthorized: Email mismatch' }, { status: 403 });
    }

    if (!initiatorEmail || !initiatorName || !recipientEmail || !recipientName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: initiatorEmail,
        line_items: [
          {
            price: Deno.env.get('STRIPE_LIMITED_COMM_PRICE_ID'),
            quantity: 1,
          },
        ],
        success_url: `${new URL(req.url).origin}/TimedChatSession?session_id={CHECKOUT_SESSION_ID}&status=success`,
        cancel_url: `${new URL(req.url).origin}/TimedChatSession?status=cancelled`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          initiator_email: initiatorEmail,
          initiator_name: initiatorName,
          recipient_email: recipientEmail,
          recipient_name: recipientName,
          session_type: 'timed_chat',
        },
      },
      {
        idempotencyKey,
      }
    );

    return Response.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Timed chat checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});