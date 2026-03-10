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

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return Response.json({ error: 'paymentMethodId required' }, { status: 400 });
    }

    // Get the saved payment method record to get the Stripe ID
    const savedMethod = await base44.entities.SavedPaymentMethod.get(paymentMethodId);

    if (!savedMethod) {
      return Response.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Detach from Stripe
    await stripeClient.paymentMethods.detach(savedMethod.stripe_payment_method_id);

    // Delete from database
    await base44.entities.SavedPaymentMethod.delete(paymentMethodId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});