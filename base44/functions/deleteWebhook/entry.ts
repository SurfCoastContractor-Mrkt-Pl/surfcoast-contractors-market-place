import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
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