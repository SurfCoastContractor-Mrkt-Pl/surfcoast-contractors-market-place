import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

// SECURITY: Database-backed idempotency for webhook processing (no in-memory storage)
// This ensures reliable deduplication in distributed/serverless environments
async function isEventProcessed(base44, eventId) {
  try {
    const events = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({
      stripe_event_id: eventId
    });
    return events && events.length > 0;
  } catch (error) {
    console.error('Error checking webhook idempotency:', error.message);
    return false; // Assume not processed on error, allow retry
  }
}

async function markEventProcessed(base44, eventId, eventType) {
  try {
    await base44.asServiceRole.entities.ProcessedWebhookEvent.create({
      stripe_event_id: eventId,
      event_type: eventType,
      event_data: JSON.stringify({ type: eventType }),
      processed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking webhook as processed:', error.message);
    // Don't re-throw — idempotency check already passed, continue processing
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
       console.error('Webhook signature verification failed - invalid request');
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

      case 'payment_method.attached':
        await handlePaymentMethodAttached(event.data.object, base44);
        break;

      case 'account.updated':
        await handleConnectAccountUpdated(event.data.object, base44);
        break;
      
      default:
        console.debug(`Unhandled Stripe event type: ${eventType}`);
    }

    return Response.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Webhook processing error:', error.message);
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

    let confirmedPayment = null;

    if (paymentIntent.metadata?.payment_id) {
      try {
        const payment = await base44.asServiceRole.entities.Payment.get(paymentIntent.metadata.payment_id);
        if (payment) {
          confirmedPayment = payment;
          await base44.asServiceRole.entities.Payment.update(payment.id, {
            status: 'confirmed',
            confirmed_at: new Date().toISOString(),
          });
          return;
        }
      } catch (e) {
        console.warn('Could not get payment by ID for confirmation:', e.message);
      }
    }

    const email = paymentIntent.metadata?.payer_email || paymentIntent.metadata?.user_email || paymentIntent.receipt_email;
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
    console.error('Error handling payment intent success:', error.message);
  }
}

async function handleCheckoutSessionCompleted(session, base44) {
  try {
    console.log(`Checkout session completed: ${session.id}, mode: ${session.mode}, payment status: ${session.payment_status}`);

    // Handle facilitation setup session — no payment, just card saved
    if (session.mode === 'setup' && session.metadata?.payment_model === 'facilitation') {
      const shopId = session.metadata?.shop_id;
      if (shopId) {
        await base44.asServiceRole.entities.MarketShop.update(shopId, {
          payment_model: 'facilitation',
          subscription_status: 'active',
          is_active: true,
        });
        console.log(`Market shop ${shopId} activated with facilitation model via setup session`);
      }
      return;
    }

    // Handle vendor purchase (consumer buying from a market shop)
    if (session.metadata?.type === 'vendor_purchase' && session.payment_status === 'paid') {
      await handleVendorPurchaseCompleted(session, base44);
      return;
    }

    if (session.payment_status !== 'paid') {
      console.warn(`Session ${session.id} payment status is ${session.payment_status}, skipping`);
      return;
    }

    let confirmedPayment = null;

    if (session.metadata?.payment_id) {
      try {
        const payment = await base44.asServiceRole.entities.Payment.get(session.metadata.payment_id);
        if (payment) {
          confirmedPayment = payment;
          // Set timed session expiry (10 min from now) for timed tier
          const updateData = { status: 'confirmed', confirmed_at: new Date().toISOString() };
          const tier = payment.amount === 1.50 ? 'timed' : payment.amount === 1.75 ? 'quote' : 'subscription';
          if (tier === 'timed' && !payment.session_expires_at) {
            updateData.session_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
          }
          await base44.asServiceRole.entities.Payment.update(payment.id, updateData);
          console.log(`Payment ${payment.id} confirmed from checkout session (tier: ${tier})`);
        }
      } catch (e) {
        console.warn('Could not get payment by ID for session completion:', e.message);
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
          const updateData = { status: 'confirmed', confirmed_at: new Date().toISOString() };
          if (confirmedPayment.amount === 1.50 && !confirmedPayment.session_expires_at) {
            updateData.session_expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();
          }
          await base44.asServiceRole.entities.Payment.update(sorted[0].id, updateData);
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

async function handlePaymentMethodAttached(paymentMethod, base44) {
  try {
    if (paymentMethod.type !== 'card') return;
    const card = paymentMethod.card;
    if (!card) return;

    // Get customer email from Stripe
    let email = null;
    if (paymentMethod.customer) {
      try {
        const customer = await stripe.customers.retrieve(paymentMethod.customer);
        email = customer.email;
      } catch (e) {
        console.warn('Could not retrieve customer for payment method:', e.message);
      }
    }
    if (!email) return;

    // Don't save duplicates
    const existing = await base44.asServiceRole.entities.SavedPaymentMethod.filter({
      user_email: email,
      stripe_payment_method_id: paymentMethod.id,
    });
    if (existing && existing.length > 0) return;

    await base44.asServiceRole.entities.SavedPaymentMethod.create({
      user_email: email,
      stripe_customer_id: paymentMethod.customer,
      stripe_payment_method_id: paymentMethod.id,
      card_brand: card.brand,
      card_last4: card.last4,
      card_exp_month: card.exp_month,
      card_exp_year: card.exp_year,
    });
    console.log(`Saved payment method ${paymentMethod.id} for ${email}`);
  } catch (error) {
    console.error('Error handling payment method attached:', error.message);
  }
}

async function handleVendorPurchaseCompleted(session, base44) {
  try {
    const orderId = session.metadata?.order_id;
    if (!orderId) {
      console.warn('vendor_purchase session missing order_id metadata');
      return;
    }

    const order = await base44.asServiceRole.entities.ConsumerOrder.get(orderId);
    if (!order) {
      console.warn(`ConsumerOrder ${orderId} not found`);
      return;
    }

    if (order.status === 'completed') {
      console.log(`Order ${orderId} already completed — skipping`);
      return;
    }

    // Retrieve payment intent to get transfer info
    let transferId = null;
    if (session.payment_intent) {
      try {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
        transferId = pi.transfer_data?.destination ? pi.latest_charge : null;
        // Get the actual transfer from the charge
        if (pi.latest_charge) {
          const charge = await stripe.charges.retrieve(pi.latest_charge);
          transferId = charge.transfer || null;
        }
      } catch (e) {
        console.warn('Could not retrieve transfer info:', e.message);
      }
    }

    // Update inventory for each item
    try {
      const { updateInventoryAfterSale } = await import('./updateInventoryOnSale.js').catch(() => null) || {};
      if (!updateInventoryAfterSale) {
        // Call via SDK instead
        await base44.asServiceRole.functions.invoke('updateInventoryOnSale', {
          cartItems: order.items.map(i => ({ id: i.listing_id, quantity: i.quantity })),
          orderId: order.id,
        });
      }
    } catch (invErr) {
      console.warn('Could not update inventory from webhook:', invErr.message);
    }

    // Mark order as completed
    await base44.asServiceRole.entities.ConsumerOrder.update(orderId, {
      status: 'completed',
      stripe_payment_intent_id: session.payment_intent || null,
      ...(transferId ? { stripe_transfer_id: transferId } : {}),
    });

    console.log(`Vendor purchase order ${orderId} marked completed. Payment: ${session.payment_intent}`);

    // Send receipt email to consumer
    try {
      const itemList = order.items.map(i => `  • ${i.product_name} x${i.quantity} — $${i.subtotal?.toFixed(2)}`).join('\n');
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: order.consumer_email,
        from_name: 'SurfCoast Marketplace',
        subject: `Order Confirmed — ${order.shop_name} (${order.order_number})`,
        body: `Hi there,\n\nThank you for your order from ${order.shop_name}!\n\nOrder #: ${order.order_number}\n\nItems:\n${itemList}\n\nTotal Charged: $${order.total?.toFixed(2)}\n\nYour payment has been processed securely. Please contact the vendor directly to arrange pickup or delivery.\n\n— SurfCoast Marketplace`,
      });
    } catch (emailErr) {
      console.warn('Failed to send order receipt email:', emailErr.message);
    }
  } catch (error) {
    console.error('Error handling vendor purchase completed:', error.message);
  }
}

async function handleConnectAccountUpdated(account, base44) {
  try {
    if (!account.id) return;
    const shops = await base44.asServiceRole.entities.MarketShop.filter({
      stripe_connect_account_id: account.id,
    });
    if (!shops || shops.length === 0) return;

    const chargesEnabled = account.charges_enabled === true;
    const onboarded = account.details_submitted === true;

    await base44.asServiceRole.entities.MarketShop.update(shops[0].id, {
      stripe_connect_charges_enabled: chargesEnabled,
      stripe_connect_onboarded: onboarded,
    });
    console.log(`Synced Connect account ${account.id}: charges_enabled=${chargesEnabled}, onboarded=${onboarded}`);
  } catch (error) {
    console.error('Error handling Connect account updated:', error.message);
  }
}

async function handleCheckoutSessionExpired(session, base44) {
  try {
    console.log(`Checkout session expired: ${session.id}, customer: ${session.customer_email}`);

    if (session.metadata?.payment_id) {
      try {
        const payment = await base44.asServiceRole.entities.Payment.get(session.metadata.payment_id);
        if (payment) {
          await base44.asServiceRole.entities.Payment.update(payment.id, { status: 'expired' });
          console.log(`Payment ${payment.id} marked as expired (session expired)`);
          return;
        }
      } catch (e) {
        console.warn('Could not get payment by ID for expiry:', e.message);
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