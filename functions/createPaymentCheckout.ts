import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  let paymentRecord = null;
  const base44 = createClientFromRequest(req);

  try {

    const { payerEmail, payerName, payerType, contractorId, contractorEmail, contractorName } = await req.json();

    if (!payerEmail || !payerName || !payerType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a Payment record first (service role to avoid RLS issues with unauthed users)
    paymentRecord = await base44.asServiceRole.entities.Payment.create({
      payer_email: payerEmail,
      payer_name: payerName,
      payer_type: payerType,
      contractor_id: contractorId || null,
      contractor_email: contractorEmail || null,
      amount: 1.50,
      status: 'pending',
      purpose: payerType === 'contractor'
        ? 'Contractor platform access fee'
        : `Customer access to contact contractor ${contractorName}`,
    });

    // Use Stripe price for $1.50 one-time payment
    const origin = req.headers.get('origin') || 'https://localhost:3000';
    let session;
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: payerEmail,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'SurfCoast Platform Access Fee',
                description: 'One-time platform access fee for SurfCoast Contractor Market Place',
              },
              unit_amount: 150, // $1.50 in cents
            },
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
      // Handle Stripe rate limits and other API errors
      if (stripeError.status === 429) {
        console.error('Stripe rate limit exceeded:', stripeError.message);
        await base44.asServiceRole.entities.Payment.delete(paymentRecord.id);
        return Response.json({ error: 'Service temporarily unavailable. Please try again in a moment.' }, { status: 429 });
      }
      throw stripeError;
    }

    return Response.json({
      sessionId: session.id,
      paymentId: paymentRecord.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error.message);
    console.error('Error type:', error.type);
    console.error('Full error:', error);
    
    // Delete orphaned payment record if checkout fails
    if (paymentRecord && paymentRecord.id) {
      try {
        await base44.asServiceRole.entities.Payment.delete(paymentRecord.id);
        console.log(`Cleaned up orphaned payment record: ${paymentRecord.id}`);
      } catch (deleteError) {
        console.error('Failed to clean up payment record:', deleteError.message);
      }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});