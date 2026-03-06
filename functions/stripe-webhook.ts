import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@16.11.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const signature = req.headers.get('stripe-signature');
    if (!signature) {
      console.error('Missing Stripe signature');
      return Response.json({ error: 'Missing signature' }, { status: 400 });
    }

    const body = await req.text();
    
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    
    console.log(`Processing Stripe event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object, base44);
        break;
      
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object, base44);
        break;
      
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object, base44);
        break;
      
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object, base44);
        break;
      
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object, base44);
        break;
      
      case 'charge.dispute.created':
        await handleDisputeCreated(event.data.object, base44);
        break;
      
      case 'charge.failed':
        await handleChargeFailed(event.data.object, base44);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object, base44);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleSubscriptionCreated(subscription, base44) {
  try {
    const email = subscription.metadata?.user_email || subscription.billing_details?.email;
    if (!email) {
      console.warn('Subscription created without email metadata');
      return;
    }

    const userType = subscription.metadata?.user_type || 'customer';
    
    await base44.asServiceRole.entities.Subscription.create({
      user_email: email,
      user_type: userType,
      stripe_subscription_id: subscription.id,
      status: subscription.status === 'active' ? 'active' : subscription.status,
      start_date: new Date(subscription.start_date * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      amount_paid: subscription.items.data[0]?.plan?.amount || 0,
    });

    console.log(`Subscription created: ${subscription.id} for ${email}`);
  } catch (error) {
    console.error('Error handling subscription creation:', error);
  }
}

async function handleSubscriptionUpdated(subscription, base44) {
  try {
    const email = subscription.metadata?.user_email;
    if (!email) {
      console.warn('Subscription updated without email metadata');
      return;
    }

    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      stripe_subscription_id: subscription.id
    });

    if (subscriptions && subscriptions.length > 0) {
      const newStatus = subscription.status === 'active' ? 'active' : 
                       subscription.status === 'canceled' ? 'cancelled' : 
                       subscription.status === 'past_due' ? 'past_due' : subscription.status;

      await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
        status: newStatus,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      });

      console.log(`Subscription updated: ${subscription.id} - status: ${newStatus}`);
    }
  } catch (error) {
    console.error('Error handling subscription update:', error);
  }
}

async function handleSubscriptionDeleted(subscription, base44) {
  try {
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      stripe_subscription_id: subscription.id
    });

    if (subscriptions && subscriptions.length > 0) {
      await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
        status: 'cancelled',
      });
      console.log(`Subscription deleted: ${subscription.id}`);
    }
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
  }
}

async function handleInvoicePaid(invoice, base44) {
  try {
    const email = invoice.customer_email || invoice.metadata?.user_email;
    if (!email) {
      console.warn('Invoice paid without customer email');
      return;
    }

    console.log(`Invoice paid: ${invoice.id} for ${email}`);
    // Additional invoice processing can be added here
  } catch (error) {
    console.error('Error handling invoice paid:', error);
  }
}

async function handleInvoicePaymentFailed(invoice, base44) {
  try {
    const email = invoice.customer_email || invoice.metadata?.user_email;
    if (!email) {
      console.warn('Invoice payment failed without customer email');
      return;
    }

    // Update subscription status to past_due
    const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
      stripe_subscription_id: invoice.subscription
    });

    if (subscriptions && subscriptions.length > 0) {
      await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
        status: 'past_due',
      });
    }

    console.log(`Invoice payment failed: ${invoice.id} for ${email}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
}

async function handleDisputeCreated(charge, base44) {
  try {
    console.log(`Dispute created for charge: ${charge.id}`);
    // Implement dispute handling logic here
    // Could notify admins, update order status, etc.
  } catch (error) {
    console.error('Error handling dispute:', error);
  }
}

async function handleChargeFailed(charge, base44) {
  try {
    console.log(`Charge failed: ${charge.id} - Reason: ${charge.failure_reason}`);
    // Implement failed charge handling
  } catch (error) {
    console.error('Error handling failed charge:', error);
  }
}

async function handlePaymentIntentSucceeded(paymentIntent, base44) {
  try {
    console.log(`Payment intent succeeded: ${paymentIntent.id}, metadata: ${JSON.stringify(paymentIntent.metadata)}`);

    // Try to match by payment_id in metadata first
    if (paymentIntent.metadata?.payment_id) {
      const payments = await base44.asServiceRole.entities.Payment.filter({
        id: paymentIntent.metadata.payment_id
      });
      if (payments && payments.length > 0) {
        await base44.asServiceRole.entities.Payment.update(payments[0].id, {
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        });
        console.log(`Payment confirmed by payment_id: ${payments[0].id}`);
        return;
      }
    }

    // Fallback: match by payer_email if available
    const email = paymentIntent.metadata?.user_email || paymentIntent.receipt_email;
    if (email) {
      const payments = await base44.asServiceRole.entities.Payment.filter({
        payer_email: email,
        status: 'pending',
      });
      if (payments && payments.length > 0) {
        // Update the most recent pending payment
        const sorted = payments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        await base44.asServiceRole.entities.Payment.update(sorted[0].id, {
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        });
        console.log(`Payment confirmed by email fallback: ${sorted[0].id}`);
      }
    }
  } catch (error) {
    console.error('Error handling payment intent success:', error);
  }
}