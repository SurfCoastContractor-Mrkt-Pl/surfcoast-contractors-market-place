import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripeClient = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userEmail, paymentMethodId, cardName, phone, cardholderName } = await req.json();

    if (!userEmail || !paymentMethodId) {
      return Response.json(
        { error: 'userEmail and paymentMethodId required' },
        { status: 400 }
      );
    }

    // Prevent saving payment methods on behalf of other users
    if (user.role !== 'admin' && user.email.toLowerCase() !== userEmail.toLowerCase()) {
      return Response.json({ error: 'Forbidden: You can only manage your own payment methods' }, { status: 403 });
    }



    // Get payment method details from Stripe
    const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);

    // Log for debugging
    console.log(`Payment method retrieved: ${paymentMethodId}, card brand: ${paymentMethod.card?.brand}, last4: ${paymentMethod.card?.last4}`);

    // Save payment method info to database
    console.log(`Attempting to save payment method for email: ${userEmail}`);
    const savedMethod = await base44.entities.SavedPaymentMethod.create({
      user_email: userEmail,
      stripe_payment_method_id: paymentMethodId,
      card_name: cardName || 'Unnamed Card',
      card_brand: paymentMethod.card.brand,
      card_last4: paymentMethod.card.last4,
      card_exp_month: paymentMethod.card.exp_month,
      card_exp_year: paymentMethod.card.exp_year,
    });

    console.log(`Successfully saved payment method with ID: ${savedMethod.id}`);
    return Response.json({ success: true, data: savedMethod });
  } catch (error) {
    console.error('Error saving payment method:', error.message);
    return Response.json({ error: error.message }, { status: error.status || 500 });
  }
});