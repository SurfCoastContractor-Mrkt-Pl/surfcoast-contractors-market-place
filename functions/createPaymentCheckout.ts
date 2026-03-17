import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const base44 = createClientFromRequest(req);
    
    // PCI Compliance: Never accept card data
    if (body.card || body.cardNumber || body.cvv) {
      return Response.json({ error: 'Card data not allowed' }, { status: 400 });
    }

    const { payerEmail, payerName, payerType, contractorId, contractorEmail, contractorName, idempotencyKey, tier, quoteMetaParam } = body;

    // Validate required fields
    if (!payerEmail || !payerName || !payerType || !idempotencyKey) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payerEmail)) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Get price ID from tier
    const PRICE_MAP = {
      quote: Deno.env.get('STRIPE_QUOTE_PRICE_ID'),
      timed: Deno.env.get('STRIPE_LIMITED_COMM_PRICE_ID'),
    };
    const priceId = PRICE_MAP[tier] || PRICE_MAP.quote;

    if (!priceId) {
      console.error(`Missing price ID for tier: ${tier}`);
      return Response.json({ error: 'Configuration error' }, { status: 500 });
    }

    // Simple idempotency check - only query by idempotency key and status
    let existingPayment = null;
    try {
      const payments = await base44.asServiceRole.entities.Payment.list();
      existingPayment = payments.find(p => 
        p.idempotency_key === idempotencyKey && 
        (p.status === 'pending' || p.status === 'confirmed')
      );
    } catch (e) {
      console.warn('Idempotency check skipped:', e.message);
    }

    if (existingPayment) {
      return Response.json({
        sessionId: existingPayment.stripe_session_id,
        paymentId: existingPayment.id,
        url: existingPayment.stripe_checkout_url,
        duplicate: true
      });
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

    // Create Stripe checkout session
    const origin = req.headers.get('origin') || 'https://localhost:3000';
    const successUrl = `${origin}/Success?payment_id=${paymentRecord.id}${quoteMetaParam || ''}${tier === 'timed' ? `&tier=timed&contractor_id=${encodeURIComponent(contractorId || '')}&contractor_email=${encodeURIComponent(contractorEmail || '')}&contractor_name=${encodeURIComponent(contractorName || '')}` : ''}`;

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: payerEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: `${origin}/Cancel`,
      payment_intent_data: {
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
    });

    // Update payment with session info
    await base44.asServiceRole.entities.Payment.update(paymentRecord.id, {
      stripe_session_id: session.id,
      stripe_checkout_url: session.url,
    });

    console.log(`Checkout created: ${session.id} for payment ${paymentRecord.id}`);

    return Response.json({
      sessionId: session.id,
      paymentId: paymentRecord.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Payment checkout error:', error.message);
    return Response.json({ 
      error: error.message || 'Checkout failed' 
    }, { status: error.statusCode || 500 });
  }
});