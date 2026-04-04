import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = await import('npm:stripe@14.0.0').then((mod) => new mod.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { methodId } = await req.json();

    if (!methodId) {
      return Response.json({ error: 'Missing methodId' }, { status: 400 });
    }

    // Delete from Stripe
    await stripe.paymentMethods.detach(methodId);

    // Delete from database
    await base44.asServiceRole.entities.SavedPaymentMethod.delete(methodId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Delete payment method error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});