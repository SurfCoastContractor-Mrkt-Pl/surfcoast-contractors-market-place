import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notificationId } = await req.json();

    if (!notificationId) {
      return Response.json({ error: 'Missing notificationId' }, { status: 400 });
    }

    const notification = await base44.entities.Notification.update(notificationId, {
      read: true,
      read_at: new Date().toISOString()
    });

    return Response.json({ success: true, notification });
  } catch (error) {
    console.error('markNotificationRead error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});