import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

// Get or create a Stripe Customer for the given email, storing the ID on our SavedPaymentMethod entity
async function getOrCreateStripeCustomer(base44, email, name) {
  // Check if we already have a Stripe customer ID stored
  const saved = await base44.asServiceRole.entities.SavedPaymentMethod.filter({ user_email: email });
  
  // Look for a record that has a stripe_customer_id
  const withCustomer = saved.find(s => s.stripe_customer_id);
  if (withCustomer) {
    return withCustomer.stripe_customer_id;
  }

  // Search Stripe for existing customer by email
  const existing = await stripe.customers.list({ email, limit: 1 });
  if (existing.data.length > 0) {
    const customerId = existing.data[0].id;
    // Store it on any existing record if possible
    if (saved.length > 0) {
      await base44.asServiceRole.entities.SavedPaymentMethod.update(saved[0].id, { stripe_customer_id: customerId });
    }
    return customerId;
  }

  // Create new Stripe customer
  const customer = await stripe.customers.create({ email, name });
  return customer.id;
}

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: max 5 checkout attempts per hour per user
    const rateLimitEntries = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: user.email,
      limit_type: 'payment_checkout'
    });
    
    if (rateLimitEntries?.length > 0) {
      const tracker = rateLimitEntries[0];
      const windowAge = Date.now() - new Date(tracker.created_date).getTime();
      if (windowAge < 3600000 && tracker.request_count >= 5) {
        return Response.json({ error: 'Too many payment attempts. Please try again later.' }, { status: 429 });
      }
      if (windowAge < 3600000) {
        await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
          request_count: tracker.request_count + 1
        });
      }
    } else {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: user.email,
        limit_type: 'payment_checkout',
        request_count: 1,
        window_start: new Date().toISOString(),
        window_duration_seconds: 3600
      });
    }

    // PCI Compliance: Never accept raw card data
    if (body.card || body.cardNumber || body.cvv) {
      return Response.json({ error: 'Card data not allowed' }, { status: 400 });
    }

    const { payerEmail, payerName, payerType, contractorId, contractorEmail, contractorName, idempotencyKey, tier, quoteMetaParam } = body;

    // Verify payer email matches authenticated user
    if (payerEmail !== user.email) {
      return Response.json({ error: 'Forbidden: You can only create payments for your own account' }, { status: 403 });
    }

    if (!payerEmail || !payerName || !payerType || !idempotencyKey) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    const PRICE_MAP = {
      quote: Deno.env.get('STRIPE_QUOTE_PRICE_ID'),
      timed: Deno.env.get('STRIPE_LIMITED_COMM_PRICE_ID'),
    };
    const priceId = PRICE_MAP[tier] || PRICE_MAP.quote;

    if (!priceId) {
      console.error(`Missing price ID for tier: ${tier}`);
      return Response.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Idempotency check — use filter instead of listing ALL payments
    let existingPayment = null;
    try {
      const payments = await base44.asServiceRole.entities.Payment.filter({
        idempotency_key: idempotencyKey,
      });
      existingPayment = payments?.find(p =>
        p.status === 'pending' || p.status === 'confirmed'
      );
    } catch (e) {
      console.warn('Idempotency check skipped:', e.message);
    }

    if (existingPayment) {
      return Response.json({
        sessionId: existingPayment.stripe_session_id,
        paymentId: existingPayment.id,
        url: existingPayment.stripe_checkout_url,
        duplicate: true,
      });
    }

    // Get or create Stripe Customer so saved cards are pre-filled
    let customerId = null;
    try {
      customerId = await getOrCreateStripeCustomer(base44, payerEmail, payerName);
      console.log(`Stripe customer: ${customerId} for ${payerEmail}`);
    } catch (e) {
      console.warn('Could not get/create Stripe customer, falling back to email:', e.message);
    }

    // Create payment record
    const paymentRecord = await base44.asServiceRole.entities.Payment.create({
      payer_email: payerEmail,
      payer_name: payerName,
      payer_type: payerType,
      contractor_id: contractorId || null,
      contractor_email: contractorEmail || null,
      amount: tier === 'timed' ? 1.50 : 1.75,
      status: 'pending',
      purpose: tier === 'timed'
        ? `10-minute chat with ${contractorName}`
        : `Quote request from ${contractorName}`,
      idempotency_key: idempotencyKey,
    });

    const origin = req.headers.get('origin') || 'https://localhost:3000';
    const successUrl = `${origin}/Success?payment_id=${paymentRecord.id}${quoteMetaParam || ''}${tier === 'timed' ? `&tier=timed&contractor_id=${encodeURIComponent(contractorId || '')}&contractor_email=${encodeURIComponent(contractorEmail || '')}&contractor_name=${encodeURIComponent(contractorName || '')}` : ''}`;

    // Build session params — use customer ID for saved card pre-fill, else fall back to email
    const sessionParams = {
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: `${origin}/Cancel`,
      payment_intent_data: {
        setup_future_usage: 'on_session', // Save card for future payments
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          payment_id: paymentRecord.id,
          payer_email: payerEmail,
          tier: tier || 'quote',
        },
      },
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        payment_id: paymentRecord.id,
      },
    };

    if (customerId) {
      sessionParams.customer = customerId;
    } else {
      sessionParams.customer_email = payerEmail;
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    await base44.asServiceRole.entities.Payment.update(paymentRecord.id, {
      stripe_session_id: session.id,
      stripe_checkout_url: session.url,
    });

    // Store/update the stripe_customer_id on a SavedPaymentMethod record if we have one
    if (customerId) {
      try {
        const saved = await base44.asServiceRole.entities.SavedPaymentMethod.filter({ user_email: payerEmail });
        if (saved.length > 0 && !saved[0].stripe_customer_id) {
          await base44.asServiceRole.entities.SavedPaymentMethod.update(saved[0].id, { stripe_customer_id: customerId });
        }
      } catch (e) {
        console.warn('Could not store customer ID:', e.message);
      }
    }

    console.log(`Checkout created: ${session.id} for payment ${paymentRecord.id}, customer: ${customerId}`);

    return Response.json({
      sessionId: session.id,
      paymentId: paymentRecord.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Payment checkout error - request failed');
    return Response.json({
      error: 'Checkout failed - please try again',
    }, { status: error.statusCode || 500 });
  }
});