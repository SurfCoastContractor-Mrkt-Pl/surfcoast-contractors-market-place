import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
const stripeClient = new Stripe(secretKey);

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

    // Validate card data exists
    if (!paymentMethod.card) {
      return Response.json({ error: 'Payment method is not a valid card' }, { status: 400 });
    }

    // Save payment method info to database
    const savedMethod = await base44.entities.SavedPaymentMethod.create({
      user_email: userEmail,
      stripe_payment_method_id: paymentMethodId,
      card_name: cardName || 'Unnamed Card',
      card_brand: paymentMethod.card.brand,
      card_last4: paymentMethod.card.last4,
      card_exp_month: paymentMethod.card.exp_month,
      card_exp_year: paymentMethod.card.exp_year,
    });

    return Response.json({ success: true, data: savedMethod });
  } catch (error) {
    console.error('Error saving payment method');

    // Log to ErrorLog
    try {
      await base44.asServiceRole.functions.invoke('createStripeErrorLog', {
        error_type: 'payment',
        error_message: 'Failed to save payment method',
        user_email: userEmail || 'unknown',
        user_type: 'unknown',
        action: 'Save payment method',
        severity: 'medium',
        context: JSON.stringify({ errorCode: error.code }),
      });
    } catch (logError) {
      console.error('Failed to log error');
    }

    return Response.json({ 
      error: 'Failed to save payment method' 
    }, { status: error.statusCode || 500 });
  }
});