import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { endpoint, keys } = await req.json();
    if (!endpoint || !keys?.auth || !keys?.p256dh) {
      return Response.json({ error: 'Invalid subscription data' }, { status: 400 });
    }

    // Check if already exists
    const existing = await base44.entities.PushSubscription.filter({ 
      user_email: user.email, 
      endpoint 
    });

    if (existing?.length > 0) {
      return Response.json({ registered: true });
    }

    // Create new subscription
    await base44.entities.PushSubscription.create({
      user_email: user.email,
      endpoint,
      auth_key: keys.auth,
      p256dh_key: keys.p256dh,
      is_active: true,
    });

    return Response.json({ registered: true });
  } catch (error) {
    console.error('Push registration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});