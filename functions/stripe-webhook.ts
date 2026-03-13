import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// In-memory idempotency tracking (24-hour TTL)
const processedEvents = new Map();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000;

function isEventProcessed(eventId) {
  if (processedEvents.has(eventId)) {
    const timestamp = processedEvents.get(eventId);
    if (Date.now() - timestamp < IDEMPOTENCY_TTL) {
      return true;
    }
    processedEvents.delete(eventId);
  }
  return false;
}

function markEventProcessed(eventId) {
  processedEvents.set(eventId, Date.now());
  // Cleanup expired entries
  for (const [id, ts] of processedEvents.entries()) {
    if (Date.now() - ts > IDEMPOTENCY_TTL) {
      processedEvents.delete(id);
    }
  }
}

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

    // Check idempotency: prevent duplicate processing
    if (isEventProcessed(event.id)) {
      console.log(`Skipping duplicate event: ${event.id} (${event.type})`);
      return Response.json({ received: true, duplicate: true }, { status: 200 });
    }
    markEventProcessed(event.id);

    // CRITICAL: Verify webhook secret is configured
    if (!webhookSecret) {
      console.error('CRITICAL: STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);
    
    console.log(`Processing Stripe event: ${event.type} (ID: ${event.id})`);

    // CRITICAL: Authenticate before processing any events
    const base44 = createClientFromRequest(req);
    
    // Verify webhook secret before processing
    if (!webhookSecret) {
      console.error('CRITICAL: STRIPE_WEBHOOK_SECRET not configured');
      return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }
    
    // Process events in order of priority
    const eventType = event.type;
    
    switch (eventType) {
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
        // Log unhandled events but still mark as processed
        console.debug(`Unhandled Stripe event type: ${eventType}`);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error.message, error.code || '');
    return Response.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
});

async function handleSubscriptionCreated(subscription, base44) {
  try {
    // Note: email is NOT stored in Stripe metadata (PII policy) — retrieve from customer object instead
    const email = subscription.metadata?.user_email || subscription.customer_email;
    if (!email) {
      console.warn('Subscription created without resolvable email — skipping record creation');
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

    } catch (error) {
       console.error('Error handling subscription creation:', error.message);
     }
}

async function handleSubscriptionUpdated(subscription, base44) {
  try {
    // Match by stripe_subscription_id only — no email needed
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

      }
      } catch (error) {
       console.error('Error handling subscription update:', error.message);
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
      }
      } catch (error) {
      console.error('Error handling subscription deletion:', error.message);
      }
}

async function handleInvoicePaid(invoice, base44) {
  try {
    const email = invoice.customer_email || invoice.metadata?.user_email;
    if (!email) {
      console.warn('Invoice paid without customer email');
      return;
    }

    // Additional invoice processing can be added here
    } catch (error) {
     console.error('Error handling invoice paid:', error.message);
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

    } catch (error) {
      console.error('Error handling invoice payment failed:', error.message);
    }
}

async function handleDisputeCreated(charge, base44) {
  try {
    console.log(`Dispute created for charge: ${charge.id}`);
    // Implement dispute handling logic here
    // Could notify admins, update order status, etc.
    } catch (error) {
    console.error('Error handling dispute:', error.message);
    }
}

async function handleChargeFailed(charge, base44) {
  try {
    const failureCode = charge.failure_code || 'card_declined';
    const failureMessage = charge.failure_message || 'Card declined';
    console.log(`Charge failed: ${charge.id} - Code: ${failureCode} - Reason: ${failureMessage}`);

    // Map Stripe failure codes to user-friendly reasons
    const declineReasonMap = {
      insufficient_funds: 'insufficient_funds',
      card_declined: 'card_declined',
      expired_card: 'expired_card',
      incorrect_cvc: 'card_declined',
      processing_error: 'card_declined',
      do_not_honor: 'card_declined',
    };
    const reason = declineReasonMap[failureCode] || 'declined';

    // Update any pending payment records associated with this charge
    const email = charge.billing_details?.email || charge.metadata?.payer_email;
    if (email) {
      const payments = await base44.asServiceRole.entities.Payment.filter({
        payer_email: email,
        status: 'pending',
      });
      if (payments && payments.length > 0) {
        const sorted = payments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
        await base44.asServiceRole.entities.Payment.update(sorted[0].id, {
          status: 'expired',
        });
      }
    }

    // Send user notification email
    if (email) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: email,
          from_name: 'SurfCoast Payments',
          subject: 'Payment Unsuccessful — Action Required',
          body: `Your payment of $1.75 could not be processed.\n\nReason: ${failureMessage}\n\nPlease return to SurfCoast Contractor Market Place and try again with a different card or ensure your card has sufficient funds.\n\nIf you believe this is an error, please contact your bank.\n\n— SurfCoast Contractor Market Place`,
        });
      } catch (emailErr) {
        console.warn('Failed to send decline notification email');
      }
    }
  } catch (error) {
    console.error('Error handling failed charge:', error.message);
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
        }
        }
        } catch (error) {
        console.error('Error handling payment intent success:', error.message);
        }
}