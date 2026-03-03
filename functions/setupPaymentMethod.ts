import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, paymentMethodId, cardName } = await req.json();

    if (!userEmail || !paymentMethodId) {
      return Response.json(
        { error: 'userEmail and paymentMethodId required' },
        { status: 400 }
      );
    }

    const stripe = await import('npm:stripe@17.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    // Get payment method details from Stripe
    const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);

    // Save payment method info to database
    const savedMethod = await base44.asServiceRole.entities.SavedPaymentMethod.create({
      user_email: userEmail,
      stripe_payment_method_id: paymentMethodId,
      card_name: cardName || 'Unnamed Card',
      card_brand: paymentMethod.card.brand,
      card_last4: paymentMethod.card.last4,
      card_exp_month: paymentMethod.card.exp_month,
      card_exp_year: paymentMethod.card.exp_year,
    });

    return Response.json(savedMethod);
  } catch (error) {
    console.error('Error saving payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});