import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await base44.entities.Notification.filter(
      { user_email: user.email, read: false },
      '-created_date',
      10
    );

    const unreadCount = notifications.length;

    return Response.json({ 
      unreadCount, 
      notifications,
      success: true 
    });
  } catch (error) {
    console.error('getUnreadNotifications error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});