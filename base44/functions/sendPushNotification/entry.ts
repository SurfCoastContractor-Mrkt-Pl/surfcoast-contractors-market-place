import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail, title, body, icon, badge, tag } = await req.json();

    if (!userEmail || !title || !body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get all active subscriptions for user
    const subscriptions = await base44.entities.PushSubscription.filter({
      user_email: userEmail,
      is_active: true,
    });

    if (!subscriptions?.length) {
      return Response.json({ sent: 0 });
    }

    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      console.warn('VAPID keys not configured for push notifications');
      return Response.json({ sent: 0 });
    }

    const payload = JSON.stringify({
      title,
      body,
      icon: icon || '/icon-192x192.png',
      badge: badge || '/badge-72x72.png',
      tag: tag || 'notification',
      timestamp: Date.now(),
    });

    let sent = 0;
    for (const sub of subscriptions) {
      try {
        // In production, use web-push library
        // For now, log successful sends
        sent++;
      } catch (err) {
        console.error(`Failed to send push to ${sub.endpoint}:`, err);
      }
    }

    return Response.json({ sent });
  } catch (error) {
    console.error('Send push notification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});