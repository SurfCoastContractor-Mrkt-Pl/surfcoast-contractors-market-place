import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

Deno.serve(async (req) => {
  try {
    let stripe;
    try {
      stripe = initializeStripe();
    } catch (initErr) {
      console.error('Stripe initialization failed:', initErr.message);
      return Response.json({
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { webhookId } = await req.json();

    if (!webhookId) {
      return Response.json({ error: 'webhookId is required' }, { status: 400 });
    }

    const deleted = await stripe.webhookEndpoints.del(webhookId);
    return Response.json({ deleted });
  } catch (error) {
    console.error('deleteWebhook error');
    return Response.json({ error: 'Failed to delete webhook' }, { status: 500 });
  }
});