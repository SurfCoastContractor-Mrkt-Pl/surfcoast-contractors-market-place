import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  let paymentRecord = null;
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();
    
    // PCI Compliance: Never log or store raw card data
    if (body.card || body.cardNumber || body.cvv) {
      console.error('PCI Violation: Card data detected in request payload');
      return Response.json({ error: 'Invalid request: card data not allowed' }, { status: 400 });
    }

    const { payerEmail, payerName, payerType, contractorId, contractorEmail, contractorName, idempotencyKey, quoteMetaParam } = body;

    if (!payerEmail || !payerName || !payerType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check for duplicate request using idempotency key (if provided)
    if (idempotencyKey) {
      try {
        const existingPayments = await base44.asServiceRole.entities.Payment.filter({
          payer_email: payerEmail,
          idempotency_key: idempotencyKey,
          status: 'pending'
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
        console.warn('Idempotency check failed:', idempotencyError.message);
      }
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Only enforce auth check for contractors to prevent impersonation
    // Customers can pay without being logged in (they enter their email manually)
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
      created_date: { '$gte': fiveMinutesAgo }
    });
    
    if (recentPayments.length >= 5) {
      console.warn(`Rate limit exceeded for ${payerEmail}: ${recentPayments.length} pending payments in 5 minutes`);
      return Response.json({ 
        error: 'Too many pending payments. Please wait before creating another checkout session.' 
      }, { status: 429 });
    }

    // FRAUD CHECK: Run fraud detection before creating payment
    if (payerType === 'customer') {
      try {
        const fraudResult = await base44.asServiceRole.functions.invoke('fraudCheck', {
          customer_email: payerEmail,
          contractor_id: contractorId,
          amount: 1.75,
          _internal_service_key: Deno.env.get('INTERNAL_SERVICE_KEY') || '',
        });

        if (fraudResult && (fraudResult.blocked === true)) {
          return Response.json(
            { error: fraudResult.message || 'Payment blocked', reason: fraudResult.reason },
            { status: 429 }
          );
        }
      } catch (fraudError) {
        // Fraud check failure should not block the payment — log and continue
        console.warn('Fraud check unavailable, proceeding:', fraudError.message);
      }
    }

    // Create a Payment record first (service role to avoid RLS issues with unauthed users)
    paymentRecord = await base44.asServiceRole.entities.Payment.create({
      payer_email: payerEmail,
      payer_name: payerName,
      payer_type: payerType,
      contractor_id: contractorId || null,
      contractor_email: contractorEmail || null,
      amount: 1.75,
      status: 'pending',
      purpose: payerType === 'contractor'
        ? 'Contractor platform access fee'
        : `Quote request from contractor ${contractorName}`,
      idempotency_key: idempotencyKey || null,
    });

    // Get Stripe price ID from environment variable
    const PAYMENT_PRICE_ID = Deno.env.get('STRIPE_QUOTE_PRICE_ID');
    if (!PAYMENT_PRICE_ID) {
      throw new Error('STRIPE_QUOTE_PRICE_ID environment variable not configured');
    }
    const origin = req.headers.get('origin') || 'https://localhost:3000';
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
        mode: 'payment',
        customer_email: payerEmail,
        line_items: [
          {
            price: PAYMENT_PRICE_ID,
            quantity: 1,
          },
        ],
        success_url: `${origin}/success?payment_id=${paymentRecord.id}`,
        cancel_url: `${origin}/cancel?reason=cancelled`,
        payment_intent_data: {
          description: `SurfCoast Quote Request Fee - ${contractorName || 'Contractor'}`,
        },
        metadata: {
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
          payment_id: paymentRecord.id,
          payer_email: payerEmail,
          payer_type: payerType,
        },
      });
    } catch (stripeError) {
      console.error('Stripe checkout error:', stripeError.message, stripeError.statusCode, stripeError.code);

      // Clean up payment record
      if (paymentRecord?.id) {
        try {
          await base44.asServiceRole.entities.Payment.delete(paymentRecord.id);
        } catch (deleteError) {
            console.error('Failed to clean up payment record');
          }
        }

        // Log to ErrorLog with detailed context
        try {
          await base44.asServiceRole.functions.invoke('logError', {
            error_type: 'payment',
            error_message: stripeError.message || 'Stripe error',
            user_email: payerEmail.substring(0, 3) + '***', // Anonymize
            user_type: payerType,
            action: 'Create checkout session',
            severity: stripeError.statusCode === 429 ? 'medium' : 'high',
            context: JSON.stringify({
              statusCode: stripeError.statusCode,
              code: stripeError.code,
              amount: 1.75,
            }),
          });
        } catch (logError) {
          console.error('Failed to log error');
        }

      // Handle specific error types
      if (stripeError.statusCode === 429) {
        return Response.json({ 
          error: 'Service temporarily unavailable. Please try again in a moment.' 
        }, { status: 429 });
      }

      throw stripeError;
    }

    // Store Stripe session info on payment record for idempotency
    await base44.asServiceRole.entities.Payment.update(paymentRecord.id, {
      stripe_session_id: session.id,
      stripe_checkout_url: session.url
    });

    return Response.json({
      sessionId: session.id,
      paymentId: paymentRecord.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error');
    
    // Clean up payment record
    if (paymentRecord?.id) {
      try {
        await base44.asServiceRole.entities.Payment.delete(paymentRecord.id);
      } catch (deleteError) {
        console.error('Failed to clean up payment record');
      }
    }

    // Log to ErrorLog with detailed context
    try {
      await base44.asServiceRole.functions.invoke('logError', {
        error_type: 'payment',
        error_message: error.message || 'Checkout error',
        user_email: payerEmail ? payerEmail.substring(0, 3) + '***' : 'unknown',
        user_type: payerType || 'unknown',
        action: 'Create checkout session',
        severity: 'high',
        context: JSON.stringify({
          amount: 1.75,
        }),
      });
    } catch (logError) {
      console.error('Failed to log error');
    }

    return Response.json({ 
      error: 'An error occurred during checkout',
    }, { status: error.statusCode || 500 });
  }
});