import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.6.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

Deno.serve(async (req) => {
  try {
    let stripe;
    try {
      stripe = initializeStripe();
    } catch (initErr) {
      console.error('Stripe initialization failed:', initErr.message);
      return Response.json({
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // SECURITY: Require authentication — user can only cancel their own payments
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { payment_id } = body;

    if (!payment_id) {
      return Response.json({ 
        error: 'Missing payment_id' 
      }, { status: 400 });
    }

    // Query for payment and verify ownership
    const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
    const payment = payments?.[0];

    if (!payment) {
      return Response.json({ 
        error: 'Payment not found' 
      }, { status: 404 });
    }

    // SECURITY: Verify user owns this payment
    if (payment.payer_email !== user.email) {
      return Response.json({ 
        error: 'Forbidden: you can only cancel your own payments' 
      }, { status: 403 });
    }

    // Expire the Stripe checkout session if it exists
    if (payment.stripe_session_id) {
      try {
        await stripe.checkout.sessions.expire(payment.stripe_session_id);
        console.log(`Expired Stripe session: ${payment.stripe_session_id}`);
      } catch (stripeError) {
        console.error(`Failed to expire Stripe session: ${stripeError.message}`);
        // Continue with cancelling the payment record even if Stripe session expiration fails
      }
    }

    // Update payment status to cancelled
    await base44.asServiceRole.entities.Payment.update(payment.id, {
      status: 'expired',
    });

    console.log(`Cancelled payment: ${payment.id} for ${email}`);

    return Response.json({ 
      success: true,
      message: `Payment cancelled successfully`,
      payment_id: payment.id,
      amount: payment.amount,
      purpose: payment.purpose
    });

  } catch (error) {
    console.error('Error cancelling payment:', error);
    return Response.json({ 
      error: 'Failed to cancel payment',
      details: error.message 
    }, { status: 500 });
  }
});