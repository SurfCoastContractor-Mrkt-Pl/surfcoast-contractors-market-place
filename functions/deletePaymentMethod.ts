import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return Response.json({ error: 'paymentMethodId required' }, { status: 400 });
    }

    // Get the saved payment method to get the Stripe ID
    const savedMethod = await base44.asServiceRole.entities.SavedPaymentMethod.read(
      paymentMethodId
    );

    if (!savedMethod) {
      return Response.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Delete from Stripe
    const stripe = await import('npm:stripe@17.0.0');
    const stripeClient = new stripe.default(Deno.env.get('STRIPE_SECRET_KEY'));

    await stripeClient.paymentMethods.detach(savedMethod.stripe_payment_method_id);

    // Delete from database
    await base44.asServiceRole.entities.SavedPaymentMethod.delete(paymentMethodId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});