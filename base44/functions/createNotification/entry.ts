import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Allow service role or admin only
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { user_email, type, title, description, related_id, related_type, action_url } = await req.json();

    if (!user_email || !type || !title || !description) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const notification = await base44.asServiceRole.entities.Notification.create({
      user_email,
      type,
      title,
      description,
      related_id: related_id || null,
      related_type: related_type || null,
      action_url: action_url || null,
      read: false
    });

    return Response.json({ success: true, notification });
  } catch (error) {
    console.error('createNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});