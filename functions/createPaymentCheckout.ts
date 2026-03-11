import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const secretKey = Deno.env.get("STRIPE_SECRET_KEY");
if (!secretKey || !secretKey.startsWith('sk_')) {
  throw new Error('Invalid STRIPE_SECRET_KEY: not configured or expired');
}
const stripe = new Stripe(secretKey);

Deno.serve(async (req) => {
  let paymentRecord = null;
  const base44 = createClientFromRequest(req);

  try {

    const { payerEmail, payerName, payerType, contractorId, contractorEmail, contractorName } = await req.json();

    if (!payerEmail || !payerName || !payerType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if user is authenticated
    const isAuthenticated = await base44.auth.isAuthenticated();
    let user = null;
    if (isAuthenticated) {
      user = await base44.auth.me();
      // If authenticated, validate email matches
      if (user && user.email.toLowerCase() !== payerEmail.toLowerCase()) {
        return Response.json({ error: 'Unauthorized: email does not match authenticated user' }, { status: 403 });
      }
    }
    // Allow unauthenticated payments (public app)

    // FRAUD CHECK: Run fraud detection before creating payment
    if (payerType === 'customer') {
      const fraudCheckResp = await base44.asServiceRole.functions.invoke('fraudCheck', {
        customer_email: payerEmail,
        contractor_id: contractorId,
        amount: 1.75
      });

      if (fraudCheckResp.data?.fraud_detected) {
        return Response.json(
          {
            error: fraudCheckResp.data.message,
            reason: fraudCheckResp.data.reason
          },
          { status: 429 }
        );
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
    });

    // Use pre-configured Stripe price (prod_U7iveIQsRZcOwH / price_1T9TTTDrSxvL03OB7lwLoVKz)
    const PAYMENT_PRICE_ID = 'price_1T9TTTDrSxvL03OB7lwLoVKz';
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
        success_url: `${origin}/success?payment_id=${paymentRecord.id}`,
        cancel_url: `${origin}/cancel`,
        metadata: {
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
          payment_id: paymentRecord.id,
          payer_email: payerEmail,
          payer_type: payerType,
        },
      });
    } catch (stripeError) {
      console.error('Stripe checkout error:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode,
      });

      // Clean up payment record
      if (paymentRecord?.id) {
        try {
          await base44.asServiceRole.entities.Payment.delete(paymentRecord.id);
        } catch (deleteError) {
          console.error('Failed to clean up payment record:', deleteError.message);
        }
      }

      // Log to ErrorLog
      try {
        await base44.asServiceRole.functions.invoke('createStripeErrorLog', {
          error_type: 'payment',
          error_message: stripeError.message,
          user_email: payerEmail,
          user_type: payerType,
          action: 'Create checkout session',
          severity: stripeError.statusCode === 429 ? 'medium' : 'high',
        });
      } catch (logError) {
        console.error('Failed to log error:', logError.message);
      }

      // Handle specific error types
      if (stripeError.statusCode === 429) {
        return Response.json({ 
          error: 'Service temporarily unavailable. Please try again in a moment.' 
        }, { status: 429 });
      }

      throw stripeError;
    }

    return Response.json({
      sessionId: session.id,
      paymentId: paymentRecord.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });
    
    // Clean up payment record
    if (paymentRecord?.id) {
      try {
        await base44.asServiceRole.entities.Payment.delete(paymentRecord.id);
        console.log(`Cleaned up orphaned payment record: ${paymentRecord.id}`);
      } catch (deleteError) {
        console.error('Failed to clean up payment record:', deleteError.message);
      }
    }

    // Log to ErrorLog
    try {
      await base44.asServiceRole.functions.invoke('createStripeErrorLog', {
        error_type: 'payment',
        error_message: error.message,
        user_email: payerEmail || 'unknown',
        user_type: payerType || 'unknown',
        action: 'Create checkout session',
        severity: 'high',
      });
    } catch (logError) {
      console.error('Failed to log error:', logError.message);
    }

    return Response.json({ 
      error: error.message,
      details: error.code || error.type 
    }, { status: error.statusCode || 500 });
  }
});