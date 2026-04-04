import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const stripe = await import('npm:stripe@14.0.0').then((mod) => new mod.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')
    );

    const base44 = createClientFromRequest(req);

    // Handle checkout.session.completed
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userEmail = session.metadata?.user_email;
      const tier = session.metadata?.tier;

      if (!userEmail || !tier) {
        console.log('Missing metadata on session');
        return Response.json({ received: true });
      }

      // Create or update subscription record
      const existing = await base44.asServiceRole.entities.Subscription.filter({
        user_email: userEmail,
      });

      const subData = {
        user_email: userEmail,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        tier,
        status: 'active',
        amount_cents: session.amount_total,
        billing_cycle_start: new Date().toISOString(),
        billing_cycle_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        user_type: session.metadata?.user_type || 'contractor',
      };

      if (existing.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(existing[0].id, subData);
      } else {
        await base44.asServiceRole.entities.Subscription.create(subData);
      }

      console.log(`Subscription created/updated for ${userEmail}`);
    }

    // Handle invoice.payment_succeeded
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      // Update subscription status
      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_customer_id: customerId,
      });

      if (subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: 'active',
        });
        console.log(`Subscription payment succeeded for ${customerId}`);
      }
    }

    // Handle customer.subscription.updated
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_customer_id: customerId,
      });

      if (subs.length > 0) {
        const status = subscription.status === 'active' ? 'active' : subscription.status === 'past_due' ? 'past_due' : 'cancelled';
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status,
          stripe_subscription_id: subscription.id,
        });
        console.log(`Subscription updated for ${customerId}: ${status}`);
      }
    }

    // Handle customer.subscription.deleted
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      const subs = await base44.asServiceRole.entities.Subscription.filter({
        stripe_customer_id: customerId,
      });

      if (subs.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subs[0].id, {
          status: 'cancelled',
          cancelled_at: new Date().toISOString(),
        });
        console.log(`Subscription cancelled for ${customerId}`);
      }
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return Response.json({ error: error.message }, { status: 400 });
  }
});