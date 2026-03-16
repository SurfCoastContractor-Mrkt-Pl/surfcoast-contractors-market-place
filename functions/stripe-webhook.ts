import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// SECURITY: Database-backed idempotency for webhook processing (no in-memory storage)
async function isEventProcessed(base44, eventId) {
  try {
    const events = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({
      stripe_event_id: eventId
    });
    return events && events.length > 0;
  } catch (error) {
    console.error('Error checking webhook idempotency:', error.message);
    return false;
  }
}

async function markEventProcessed(base44, eventId, eventType) {
  try {
    await base44.asServiceRole.entities.ProcessedWebhookEvent.create({
      stripe_event_id: eventId,
      event_type: eventType,
      processed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking webhook as processed:', error.message);
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  // CRITICAL: Verify webhook secret is configured before anything else
  if (!webhookSecret) {
    console.error('CRITICAL: STRIPE_WEBHOOK_SECRET not configured');
    return Response.json({ error: 'Webhook secret not configured' }, { status: 500 });
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

    // SDK init only AFTER signature is verified
    const base44 = createClientFromRequest(req);
    
    console.log(`Processing Stripe event: ${event.type} (ID: ${event.id})`);

    // Check idempotency: prevent duplicate processing (database-backed)
    if (await isEventProcessed(base44, event.id)) {
      console.log(`Skipping duplicate event: ${event.id} (${event.type})`);
      return Response.json({ received: true, duplicate: true }, { status: 200 });
    }
    await markEventProcessed(base44, event.id, event.type);

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
      
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object, base44);
        break;
      
      case 'checkout.session.expired':
        await handleCheckoutSessionExpired(event.data.object, base44);
        break;
      
      default:
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
    // Try metadata first, then fetch customer from Stripe to get email
    let email = subscription.metadata?.user_email;
    if (!email && subscription.customer) {
      try {
        const customer = await stripe.customers.retrieve(subscription.customer);
        email = customer.email;
      } catch (customerErr) {
        console.warn('Could not retrieve Stripe customer for email:', customerErr.message);
      }
    }
    if (!email) {
      console.warn('Subscription created without resolvable email — skipping record creation');
      return;
    }

    const userType = subscription.metadata?.user_type || 'customer';
    const newStatus = subscription.status === 'active' ? 'active' : subscription.status;

    // Check for existing pending record created by createSubscriptionCheckout (dedup by stripe_subscription_id or pending for this user)
    const existing = await base44.asServiceRole.entities.Subscription.filter({
      stripe_subscription_id: subscription.id,
    });

    if (existing && existing.length > 0) {
      // Update the existing record instead of creating a duplicate
      await base44.asServiceRole.entities.Subscription.update(existing[0].id, {
        status: newStatus,
        start_date: new Date(subscription.start_date * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        amount_paid: subscription.items.data[0]?.plan?.amount || 0,
      });
      console.log(`Updated existing subscription record for ${email} (${subscription.id})`);
      return;
    }

    // Also check for a pending record without stripe_subscription_id set yet
    const pendingRecords = await base44.asServiceRole.entities.Subscription.filter({
      user_email: email,
      status: 'pending',
    });

    if (pendingRecords && pendingRecords.length > 0) {
      await base44.asServiceRole.entities.Subscription.update(pendingRecords[0].id, {
        stripe_subscription_id: subscription.id,
        status: newStatus,
        start_date: new Date(subscription.start_date * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        amount_paid: subscription.items.data[0]?.plan?.amount || 0,
      });
      console.log(`Promoted pending subscription record for ${email} (${subscription.id})`);
      return;
    }

    await base44.asServiceRole.entities.Subscription.create({
      user_email: email,
      user_type: userType,
      stripe_subscription_id: subscription.id,
      status: newStatus,
      start_date: new Date(subscription.start_date * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      amount_paid: subscription.items.data[0]?.plan?.amount || 0,
    });
    console.log(`Created new subscription record for ${email} (${subscription.id})`);
  } catch (error) {
    console.error('Error handling subscription creation:', error.message);
  }
}

async function handleSubscriptionUpdated(subscription, base44) {
  try {
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
    // Update subscription period end if this is a renewal
    if (invoice.subscription) {
      const subscriptions = await base44.asServiceRole.entities.Subscription.filter({
        stripe_subscription_id: invoice.subscription
      });
      if (subscriptions && subscriptions.length > 0) {
        await base44.asServiceRole.entities.Subscription.update(subscriptions[0].id, {
          status: 'active',
          current_period_end: invoice.period_end
            ? new Date(invoice.period_end * 1000).toISOString()
            : subscriptions[0].current_period_end,
        });
        console.log(`Subscription renewed for ${email} (${invoice.subscription})`);
      }
    }
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
  } catch (error) {
    console.error('Error handling dispute:', error.message);
  }
}

async function handleChargeFailed(charge, base44) {
  try {
    const failureCode = charge.failure_code || 'card_declined';
    const failureMessage = charge.failure_message || 'Card declined';
    console.log(`Charge failed: ${charge.id} - Code: ${failureCode} - Reason: ${failureMessage}`);

    const declineReasonMap = {
      insufficient_funds: 'insufficient_funds',
      card_declined: 'card_declined',
      expired_card: 'expired_card',
      incorrect_cvc: 'card_declined',
      processing_error: 'card_declined',
      do_not_honor: 'card_declined',
    };
    const reason = declineReasonMap[failureCode] || 'declined';

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

    const email = paymentIntent.metadata?.user_email || paymentIntent.receipt_email;
    if (email) {
      const payments = await base44.asServiceRole.entities.Payment.filter({
        payer_email: email,
        status: 'pending',
      });
      if (payments && payments.length > 0) {
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

async function handleCheckoutSessionCompleted(session, base44) {
  try {
    console.log(`Checkout session completed: ${session.id}, payment status: ${session.payment_status}`);

    if (session.payment_status !== 'paid') {
      console.warn(`Session ${session.id} payment status is ${session.payment_status}, skipping`);
      return;
    }

    let confirmedPayment = null;

    if (session.metadata?.payment_id) {
      const payments = await base44.asServiceRole.entities.Payment.filter({
        stripe_session_id: session.id
      });
      if (payments && payments.length > 0) {
        confirmedPayment = payments[0];
        await base44.asServiceRole.entities.Payment.update(payments[0].id, {
          status: 'confirmed',
          confirmed_at: new Date().toISOString(),
        });
        console.log(`Payment ${payments[0].id} confirmed from checkout session`);
      }
    }

    if (!confirmedPayment) {
      const email = session.customer_email || session.metadata?.payer_email;
      if (email) {
        const payments = await base44.asServiceRole.entities.Payment.filter({
          payer_email: email,
          status: 'pending',
        });
        if (payments && payments.length > 0) {
          const sorted = payments.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
          confirmedPayment = sorted[0];
          await base44.asServiceRole.entities.Payment.update(sorted[0].id, {
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          });
          console.log(`Payment ${sorted[0].id} confirmed from checkout session (email match)`);
        }
      }
    }

    // Send confirmation email
    if (confirmedPayment) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: confirmedPayment.payer_email,
          from_name: 'SurfCoast Payments',
          subject: 'Payment Confirmed — Thank You!',
          body: `Thank you for your payment!\n\nAmount: $${confirmedPayment.amount}\nPurpose: ${confirmedPayment.purpose}\n\nYour payment has been successfully processed. A receipt is attached to this email.\n\nIf you have any questions, please contact support.\n\n— SurfCoast Contractor Market Place`,
        });
      } catch (emailErr) {
        console.warn('Failed to send confirmation email:', emailErr.message);
      }
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error.message);
  }
}

async function handleCheckoutSessionExpired(session, base44) {
  try {
    console.log(`Checkout session expired: ${session.id}, customer: ${session.customer_email}`);

    if (session.metadata?.payment_id) {
      const payments = await base44.asServiceRole.entities.Payment.filter({
        id: session.metadata.payment_id
      });
      if (payments && payments.length > 0) {
        await base44.asServiceRole.entities.Payment.update(payments[0].id, {
          status: 'expired',
        });
        console.log(`Payment ${session.metadata.payment_id} marked as expired (session expired)`);
        return;
      }
    }

    const email = session.customer_email || session.metadata?.payer_email;
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
        console.log(`Payment ${sorted[0].id} marked as expired (session expired, email match)`);
      }
    }
  } catch (error) {
    console.error('Error handling checkout session expired:', error.message);
  }
}