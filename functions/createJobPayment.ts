import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const { payment_id, amount_cents, contractor_id, customer_email, customer_name, purpose } = body;

    if (!payment_id || !amount_cents || !customer_email || !customer_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the customer_email in the payload matches the authenticated user
    if (customer_email !== user.email) {
      return Response.json({ error: 'Forbidden: You can only create payments for your own account' }, { status: 403 });
    }

    // Fetch the Payment record
    const payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    if (!payment) {
      return Response.json({ error: 'Payment record not found' }, { status: 404 });
    }

    // If already has a checkout URL, return it
    if (payment.stripe_checkout_url) {
      return Response.json({ checkout_url: payment.stripe_checkout_url, payment_id });
    }

    // Look up contractor's Stripe connected account (if payout-ready)
    let transferData = null;
    if (contractor_id) {
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ id: contractor_id });
      const contractor = contractors?.[0];
      if (contractor?.stripe_connected_account_id && contractor?.stripe_account_charges_enabled) {
        const platformFeePct = 18;
        const platformFeeAmount = Math.round(amount_cents * platformFeePct / 100);
        transferData = {
          destination: contractor.stripe_connected_account_id,
          amount: amount_cents - platformFeeAmount,
        };
        console.log(`Routing payout to connected account ${contractor.stripe_connected_account_id}, fee: ${platformFeeAmount} cents`);
      }
    }

    const origin = req.headers.get('origin') || 'https://surfcoast.app';
    const successUrl = `${origin}/Success?payment_id=${payment_id}`;
    const cancelUrl = `${origin}/Cancel`;

    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amount_cents,
            product_data: {
              name: purpose === 'estimate' ? 'Quote Request'
                   : purpose === 'chat' ? '10-Minute Chat Session'
                   : 'Job Payment',
              description: payment.purpose || `${purpose} fee`,
            },
          },
          quantity: 1,
        },
      ],
      customer_email: customer_email,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        payment_id,
        purpose: purpose || 'job',
        contractor_id: contractor_id || '',
      },
      payment_intent_data: {
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          payment_id,
        },
        ...(transferData ? { transfer_data: transferData } : {}),
      },
    };

    const session = await stripe.checkout.sessions.create(sessionParams);
    console.log(`createJobPayment: session ${session.id} for payment ${payment_id}, amount ${amount_cents} cents`);

    // Persist checkout URL on the payment record
    await base44.asServiceRole.entities.Payment.update(payment_id, {
      stripe_session_id: session.id,
      stripe_checkout_url: session.url,
    });

    return Response.json({ checkout_url: session.url, payment_id, session_id: session.id });
  } catch (error) {
    console.error('createJobPayment error:', error.message);
    return Response.json({ error: error.message || 'Failed to create checkout' }, { status: 500 });
  }
});