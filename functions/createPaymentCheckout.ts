import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { payerEmail, payerName, payerType, contractorId, contractorEmail, contractorName } = await req.json();

    if (!payerEmail || !payerName || !payerType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create a Payment record first
    const paymentRecord = await base44.entities.Payment.create({
      payer_email: payerEmail,
      payer_name: payerName,
      payer_type: payerType,
      contractor_id: contractorId || '',
      contractor_email: contractorEmail || '',
      amount: 1.50,
      status: 'pending',
      purpose: payerType === 'contractor'
        ? 'Contractor platform access fee'
        : `Customer access to contact contractor ${contractorName}`,
    });

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      customer_email: payerEmail,
      line_items: [
        {
          price: 'price_1T6jRwDvR0SdwJT30vCXw7ua', // Platform Access Fee price
          quantity: 1,
        },
      ],
      success_url: `${req.headers.get('origin')}/success?payment_id=${paymentRecord.id}`,
      cancel_url: `${req.headers.get('origin')}/cancel`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        payment_id: paymentRecord.id,
        payer_email: payerEmail,
        payer_type: payerType,
      },
    });

    return Response.json({
      sessionId: session.id,
      paymentId: paymentRecord.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});