import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripeClient = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, paymentMethodId, cardName, phone, cardholderName } = await req.json();

    if (!userEmail || !paymentMethodId) {
      return Response.json(
        { error: 'userEmail and paymentMethodId required' },
        { status: 400 }
      );
    }

    // Verify user exists and get their full name
    let userFullName = null;
    try {
      const user = await base44.auth.me();
      if (user?.email === userEmail) {
        userFullName = user.full_name;
      }
    } catch (err) {
      console.warn('Could not verify user full name:', err.message);
    }

    // Get payment method details from Stripe
    const paymentMethod = await stripeClient.paymentMethods.retrieve(paymentMethodId);

    // Verify cardholder name matches (if provided)
    if (cardholderName) {
      const providedName = cardholderName.trim().toLowerCase();
      const stripeName = paymentMethod.billing_details?.name?.trim().toLowerCase() || '';
      
      if (!stripeName || stripeName !== providedName) {
        console.warn(`Cardholder name mismatch for ${userEmail}: provided="${cardholderName}", Stripe="${paymentMethod.billing_details?.name}"`);
        return Response.json(
          { error: 'Cardholder name does not match the card. Please verify and try again.' },
          { status: 400 }
        );
      }
    }

    // Verify phone matches (if phone was provided)
    if (phone) {
      const normalizedProvidedPhone = phone.replace(/\D/g, '');
      const normalizedStripePhone = paymentMethod.billing_details?.phone?.replace(/\D/g, '') || '';
      
      if (normalizedProvidedPhone && normalizedStripePhone && normalizedProvidedPhone !== normalizedStripePhone) {
        console.warn(`Phone mismatch for ${userEmail}: provided=${normalizedProvidedPhone}, Stripe=${normalizedStripePhone}`);
        return Response.json(
          { error: 'Phone number does not match your billing details. Payment method not saved.' },
          { status: 400 }
        );
      }
    }

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