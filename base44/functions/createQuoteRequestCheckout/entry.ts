import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { payerEmail, payerName, payerType, jobId, jobTitle, idempotencyKey } = await req.json();

    if (!payerEmail || !payerName || !payerType || !jobId || !jobTitle) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['customer', 'contractor'].includes(payerType)) {
      return Response.json({ error: 'Invalid payer type' }, { status: 400 });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create(
      {
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: payerEmail,
        line_items: [
          {
            price: Deno.env.get('STRIPE_QUOTE_PRICE_ID'),
            quantity: 1,
          },
        ],
        success_url: `${new URL(req.url).origin}/QuoteRequestSuccess?session_id={CHECKOUT_SESSION_ID}&job_id=${jobId}`,
        cancel_url: `${new URL(req.url).origin}/QuoteRequest?job_id=${jobId}&cancelled=true`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          payer_email: payerEmail,
          payer_name: payerName,
          payer_type: payerType,
          job_id: jobId,
          job_title: jobTitle,
          session_type: 'quote_request',
        },
      },
      {
        idempotencyKey,
      }
    );

    return Response.json({ checkout_url: session.url, session_id: session.id });
  } catch (error) {
    console.error('Quote request checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});