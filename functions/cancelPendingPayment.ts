import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.6.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { email, payment_id } = body;

    if (!email && !payment_id) {
      return Response.json({ 
        error: 'Missing email or payment_id' 
      }, { status: 400 });
    }

    // Query for pending payment
    let payment;
    if (payment_id) {
      const payments = await base44.asServiceRole.entities.Payment.filter({ id: payment_id });
      payment = payments?.[0];
    } else {
      const payments = await base44.asServiceRole.entities.Payment.filter({ 
        payer_email: email,
        status: 'pending'
      });
      payment = payments?.[0];
    }

    if (!payment) {
      return Response.json({ 
        error: 'No pending payment found for this email' 
      }, { status: 404 });
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