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

    const webhooks = await stripe.webhookEndpoints.list({ limit: 10 });
    const summary = webhooks.data.map(wh => ({
      id: wh.id,
      url: wh.url,
      status: wh.status,
      events: wh.enabled_events,
    }));
    return Response.json({ webhooks: summary });
  } catch (error) {
    console.error('listWebhooks error');
    return Response.json({ error: 'Failed to list webhooks' }, { status: 500 });
  }
});