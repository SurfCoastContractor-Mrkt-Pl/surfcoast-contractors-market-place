import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  let paymentRecord = null;
  let payerEmail = null;
  let payerType = null;
  const base44 = createClientFromRequest(req);
  // Force cache refresh

  try {
    const body = await req.json();
    
    // PCI Compliance: Never log or store raw card data
    if (body.card || body.cardNumber || body.cvv) {
      console.error('PCI Violation: Card data detected in request payload');
      return Response.json({ error: 'Invalid request: card data not allowed' }, { status: 400 });
    }

    ({ payerEmail, payerType } = body);
    const { payerName, contractorId, contractorEmail, contractorName, idempotencyKey, quoteMetaParam, tier } = body;

    if (!payerEmail || !payerName || !payerType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!idempotencyKey) {
      return Response.json({ 
        error: 'Missing idempotency key. Please reload the page and try again.' 
      }, { status: 400 });
    }

    // Resolve the correct Stripe price ID based on tier
    const PRICE_ID_MAP = {
      quote: Deno.env.get('STRIPE_QUOTE_PRICE_ID'),
      timed: Deno.env.get('STRIPE_LIMITED_COMM_PRICE_ID'),
    };
    const PAYMENT_PRICE_ID = PRICE_ID_MAP[tier] || PRICE_ID_MAP.quote;

    if (!PAYMENT_PRICE_ID) {
      console.error(`CRITICAL: No price ID found for tier "${tier}". Check environment variables.`);
      return Response.json({ error: 'Payment service misconfigured: missing price ID' }, { status: 500 });
    }

    console.log(`Creating checkout for tier="${tier}", price="${PAYMENT_PRICE_ID}", payer="${payerEmail}"`);

    // Check for duplicate request using idempotency key
    try {
      const existingPayments = await base44.asServiceRole.entities.Payment.filter({
        payer_email: payerEmail,
        idempotency_key: idempotencyKey,
        status: { $in: ["pending", "confirmed"] }
      });
      if (existingPayments.length > 0) {
        console.log(`Duplicate checkout request detected for ${payerEmail}, returning existing payment`);
        const existingPayment = existingPayments[0];
        return Response.json({
          sessionId: existingPayment.stripe_session_id,
          paymentId: existingPayment.id,
          url: existingPayment.stripe_checkout_url,
          duplicate: true
        });
      }
    } catch (idempotencyError) {
      console.error('Idempotency check failed:', idempotencyError.message);
      throw idempotencyError;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Only enforce auth check for contractors to prevent impersonation
    if (payerType === 'contractor') {
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: payerEmail });
      if (contractors.length > 0) {
        const isAuthenticated = await base44.auth.isAuthenticated();
        if (!isAuthenticated) {
          return Response.json({ 
            error: 'Authentication required for this email address.' 
          }, { status: 401 });
        }
        const user = await base44.auth.me();
        if (!user || user.email.toLowerCase() !== payerEmail.toLowerCase()) {
          return Response.json({ 
            error: 'Unauthorized: email does not match authenticated user' 
          }, { status: 403 });
        }
      }
    }

    // Rate limiting: check for excessive pending payments from this email in last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const recentPayments = await base44.asServiceRole.entities.Payment.filter({
      payer_email: payerEmail,
      status: 'pending',
      created_date: { $gte: fiveMinutesAgo }
    });
    
    if (recentPayments.length >= 5) {
      console.warn(`Rate limit exceeded for ${payerEmail}: ${recentPayments.length} pending payments in 5 minutes`);
      return Response.json({ 
        error: 'Too many pending payments. Please wait before creating another checkout session.' 
      }, { status: 429 });
    }

    // FRAUD CHECK (customers only)
    if (payerType === 'customer') {
      try {
        const fraudResult = await base44.asServiceRole.functions.invoke('fraudCheck', {
          customer_email: payerEmail,
          contractor_id: contractorId,
          amount: tier === 'timed' ? 1.50 : 1.75,
          _internal_service_key: Deno.env.get('INTERNAL_SERVICE_KEY'),
        });

        if (fraudResult && (fraudResult.blocked === true)) {
          return Response.json(
            { error: fraudResult.message || 'Payment blocked', reason: fraudResult.reason },
            { status: 429 }
          );
        }
      } catch (fraudError) {
        console.warn('Fraud check unavailable, proceeding:', fraudError.message);
      }
    }

    // Create a Payment record first
    paymentRecord = await base44.asServiceRole.entities.Payment.create({
      payer_email: payerEmail,
      payer_name: payerName,
      payer_type: payerType,
      contractor_id: contractorId || null,
      contractor_email: contractorEmail || null,
      amount: tier === 'timed' ? 1.50 : 1.75,
      status: 'pending',
      purpose: payerType === 'contractor'
        ? 'Contractor platform access fee'
        : tier === 'timed'
          ? `10-minute chat session with ${contractorName}`
          : `Quote request from contractor ${contractorName}`,
      idempotency_key: idempotencyKey || null,
    });

    const BASE44_APP_ID = Deno.env.get('BASE44_APP_ID');
    const origin = req.headers.get('origin') || 'https://localhost:3000';

    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: payerEmail,
        line_items: [
          {
            price: PAYMENT_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${origin}/Success?payment_id=${paymentRecord.id}${quoteMetaParam || ''}${tier === 'timed' ? `&tier=timed&contractor_email=${encodeURIComponent(contractorEmail || '')}&contractor_name=${encodeURIComponent(contractorName || '')}` : ''}`,
        cancel_url: `${origin}/Cancel?reason=cancelled`,
        payment_intent_data: {
          description: `SurfCoast ${tier === 'timed' ? '10-Min Chat' : 'Quote Request'} Fee - ${contractorName || 'Contractor'}`,
          metadata: {
            base44_app_id: BASE44_APP_ID || 'unknown',
            payment_id: paymentRecord.id,
            payer_email: payerEmail,
            payer_type: payerType,
            tier: tier || 'quote',
          },
        },
        metadata: {
          base44_app_id: BASE44_APP_ID || 'unknown',
          payment_id: paymentRecord.id,
          payer_email: payerEmail,
          payer_type: payerType,
          tier: tier || 'quote',
        },
      });
    } catch (stripeError) {
      console.error('Stripe checkout session creation failed:', stripeError.message, 'code:', stripeError.code, 'status:', stripeError.statusCode);

      if (paymentRecord?.id) {
        try {
          await base44.asServiceRole.entities.Payment.delete(paymentRecord.id);
        } catch (deleteError) {
          console.error('Failed to clean up payment record:', deleteError.message);
        }
      }

      if (stripeError.statusCode === 429) {
        return Response.json({ 
          error: 'Service temporarily unavailable. Please try again in a moment.' 
        }, { status: 429 });
      }

      return Response.json({
        error: stripeError.message || 'Failed to create checkout session',
      }, { status: stripeError.statusCode || 500 });
    }

    // Store Stripe session info on payment record
    await base44.asServiceRole.entities.Payment.update(paymentRecord.id, {
      stripe_session_id: session.id,
      stripe_checkout_url: session.url
    });

    console.log(`Checkout session created: ${session.id} for payment ${paymentRecord.id}`);

    return Response.json({
      sessionId: session.id,
      paymentId: paymentRecord.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error.message, error.code || '', error.statusCode || '');
    
    if (paymentRecord?.id) {
      try {
        await base44.asServiceRole.entities.Payment.update(paymentRecord.id, {
          status: 'expired'
        });
      } catch (updateError) {
        console.error('Failed to mark payment as failed:', updateError.message);
      }
    }

    return Response.json({ 
      error: error.message || 'An error occurred during checkout',
    }, { status: error.statusCode || 500 });
  }
});