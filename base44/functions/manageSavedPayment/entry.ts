import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = await import('npm:stripe@17.0.0').then(m => new m.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user — enforce ownership of payment methods
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, userEmail, paymentMethodId } = await req.json();

    // Prevent acting on another user's payment methods
    if (userEmail && userEmail !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Cannot manage another user\'s payment methods' }, { status: 403 });
    }

    // Always use the authenticated user's email (ignore any supplied userEmail for non-admins)
    const resolvedEmail = user.role === 'admin' && userEmail ? userEmail : user.email;

    if (action === 'list') {
      // List saved payment methods for user
      const methods = await base44.entities.SavedPaymentMethod.filter({
        user_email: userEmail,
      });
      return Response.json({ methods });
    }

    if (action === 'save') {
      // Save new payment method
      const { stripePaymentMethodId, cardBrand, cardLast4, cardExpMonth, cardExpYear } = await req.json();

      // Get or create Stripe customer
      let customerId = null;
      const existing = await stripe.customers.list({ email: userEmail, limit: 1 });
      if (existing.data.length > 0) {
        customerId = existing.data[0].id;
      } else {
        const customer = await stripe.customers.create({ email: userEmail });
        customerId = customer.id;
      }

      // Attach payment method to customer
      await stripe.paymentMethods.attach(stripePaymentMethodId, { customer: customerId });

      // Save to database
      await base44.entities.SavedPaymentMethod.create({
        user_email: userEmail,
        stripe_customer_id: customerId,
        stripe_payment_method_id: stripePaymentMethodId,
        card_brand: cardBrand,
        card_last4: cardLast4,
        card_exp_month: cardExpMonth,
        card_exp_year: cardExpYear,
        card_name: `${cardBrand} ending in ${cardLast4}`,
      });

      return Response.json({ success: true, customerId, paymentMethodId: stripePaymentMethodId });
    }

    if (action === 'delete') {
      // Delete payment method
      await stripe.paymentMethods.detach(paymentMethodId);
      await base44.entities.SavedPaymentMethod.delete(paymentMethodId);
      return Response.json({ success: true });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Payment method management error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});