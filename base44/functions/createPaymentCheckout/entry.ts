import { createClientFromRequest } from 'npm:@base44/sdk@0.8.26';
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
      console.error('Payment checkout: Unauthorized request (no user)');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: max 5 checkout attempts per hour per user
    try {
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
    } catch (rateLimitErr) {
      console.warn('Rate limiting skipped (RLS restriction):', rateLimitErr.message);
      // Continue without rate limiting if service role access is unavailable
    }

    // PCI Compliance: Never accept raw card data
    if (body.card || body.cardNumber || body.cvv) {
      console.error('Payment checkout: PCI violation - raw card data in request');
      return Response.json({ error: 'Card data not allowed' }, { status: 400 });
    }

    const { payerEmail, payerName, payerType, contractorId, contractorEmail, contractorName, idempotencyKey, tier, quoteMetaParam } = body;

    // Verify payer email matches authenticated user
    if (payerEmail !== user.email) {
      console.error(`Payment checkout: Email mismatch - user ${user.email} trying to pay for ${payerEmail}`);
      return Response.json({ error: 'Forbidden: You can only create payments for your own account' }, { status: 403 });
    }

    // Validate required fields
    const missingFields = [];
    if (!payerEmail) missingFields.push('payerEmail');
    if (!payerName) missingFields.push('payerName');
    if (!payerType) missingFields.push('payerType');
    if (!idempotencyKey) missingFields.push('idempotencyKey');

    if (missingFields.length > 0) {
      console.error(`Payment checkout: Missing required fields - ${missingFields.join(', ')}`);
      return Response.json({ 
        error: 'Missing required fields',
        details: missingFields 
      }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      console.error(`Payment checkout: Invalid email format - ${payerEmail}`);
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    const PRICE_MAP = {
      quote: Deno.env.get('STRIPE_QUOTE_PRICE_ID'),
      timed: Deno.env.get('STRIPE_LIMITED_COMM_PRICE_ID'),
    };
    const priceId = PRICE_MAP[tier] || PRICE_MAP.quote;

    if (!priceId) {
      console.error(`Payment checkout: Missing price ID for tier '${tier}' - check environment variables`);
      return Response.json({ 
        error: 'Payment configuration error. Please contact support.',
        code: 'CONFIG_ERROR'
      }, { status: 500 });
    }

    if (!tier) {
      console.warn(`Payment checkout: No tier specified, using default 'quote'`);
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

    let session;
    try {
      session = await stripe.checkout.sessions.create(sessionParams);
    } catch (stripeError) {
      console.error(`Payment checkout: Stripe session creation failed for ${payerEmail}`, {
        stripeErrorCode: stripeError.code,
        stripeErrorMessage: stripeError.message,
        tier,
      });
      return Response.json({
        error: 'Failed to create checkout session. Please try again.',
        code: 'STRIPE_SESSION_ERROR'
      }, { status: 500 });
    }

    try {
      await base44.asServiceRole.entities.Payment.update(paymentRecord.id, {
        stripe_session_id: session.id,
        stripe_checkout_url: session.url,
      });
    } catch (dbError) {
      console.error(`Payment checkout: Failed to save session to database for ${payerEmail}`, {
        sessionId: session.id,
        paymentId: paymentRecord.id,
        dbErrorMessage: dbError.message,
      });
      // Don't fail here - session is created, just missing from DB
    }

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
    console.error('Payment checkout: Unhandled error', {
      errorMessage: error?.message,
      errorCode: error?.code,
      errorType: error?.type,
      stack: error?.stack,
    });
    
    // Don't expose internal error details to client
    return Response.json({
      error: 'Payment processing failed. Please try again or contact support.',
      code: 'PAYMENT_ERROR'
    }, { status: 500 });
  }
});