import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    // SECURITY: Validate internal service key for automated email function
    const serviceKey = req.headers.get('x-service-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!serviceKey || !expectedKey || serviceKey !== expectedKey) {
      console.warn('[SECURITY] Unauthorized access attempt to sendConsumerReviewEmail');
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const { order_id } = payload;

    if (!order_id) {
      return Response.json({ error: 'Missing order_id' }, { status: 400 });
    }

    // Fetch the consumer order
    const order = await base44.asServiceRole.entities.ConsumerOrder.get(order_id);
    
    if (!order) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if a review email request already exists
    const existingRequest = await base44.asServiceRole.entities.ReviewEmailRequest.filter({
      scope_id: order_id,
    });

    if (existingRequest && existingRequest.length > 0) {
      console.log(`Review email request already exists for order ${order_id}`);
      return Response.json({ status: 'already_sent' });
    }

    // Generate a unique token for the review link
    const reviewToken = crypto.getRandomValues(new Uint8Array(32)).reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

    // Create review email request record
    const reviewRequest = await base44.asServiceRole.entities.ReviewEmailRequest.create({
      scope_id: order_id,
      contractor_email: order.shop_id, // Using shop_id as a placeholder; in real scenario, fetch shop owner email
      contractor_id: order.shop_id,
      customer_email: order.consumer_email,
      customer_name: order.consumer_email, // Ideally fetch from customer profile
      job_title: `Order at ${order.shop_name}`,
      scope_closed_at: order.placed_at,
      email_send_at: new Date().toISOString(),
      status: 'pending',
      review_link_token: reviewToken,
    });

    // Fetch shop details for owner email
    const shop = await base44.asServiceRole.entities.MarketShop.get(order.shop_id);
    const shopOwnerEmail = shop?.email || 'noreply@surfcoastmarket.com';

    // Send email via integration
    const emailResult = await base44.integrations.Core.SendEmail({
      to: order.consumer_email,
      subject: `How was your purchase at ${order.shop_name}?`,
      body: `
Hi there,

Thank you for your recent purchase at **${order.shop_name}**! 

We'd love to hear about your experience. Your review helps other shoppers make informed decisions and helps vendors improve their offerings.

**[Leave a Review](${Deno.env.get('APP_URL')}/review-consumer-order?token=${reviewToken}&order_id=${order_id})**

Your honest feedback takes just 2 minutes and makes a real difference.

Thanks,
The SurfCoast Marketplace Team
      `.trim(),
    });

    // Update review request status
    await base44.asServiceRole.entities.ReviewEmailRequest.update(reviewRequest.id, {
      email_sent_at: new Date().toISOString(),
      status: 'sent',
    });

    console.log(`Review email sent to ${order.consumer_email} for order ${order_id}`);
    return Response.json({ status: 'sent', request_id: reviewRequest.id });
  } catch (error) {
    console.error('Error sending review email:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});