import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized - authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { recipientEmail, notificationType, projectId, message, metadata } = body;

    if (!recipientEmail || !notificationType || !projectId) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify sender has authority to send notifications for this project
    // Only allow if user is admin or is the creator of the project
    if (user.role !== 'admin') {
      // Non-admin users can only send notifications for their own projects
      // This would need to be verified against the actual project ownership
      return Response.json({ error: 'Unauthorized - cannot send notifications for this project' }, { status: 403 });
    }

    // Validate notification type
    const allowedTypes = ['project_update', 'milestone_complete', 'message', 'collaboration_invite'];
    if (!allowedTypes.includes(notificationType)) {
      return Response.json({ error: 'Invalid notification type' }, { status: 400 });
    }

    // Log notification for audit trail
    const notificationRecord = await base44.asServiceRole.entities.MatchNotification.create({
      recipient_email: recipientEmail,
      notification_type: notificationType,
      project_id: projectId,
      sender_email: user.email,
      message: message || null,
      metadata: metadata ? JSON.stringify(metadata) : null,
      read: false,
      sent_at: new Date().toISOString()
    }).catch(() => null);

    return Response.json({ 
      success: true, 
      id: notificationRecord?.id || null,
      message: 'Notification queued for delivery'
    });
  } catch (error) {
    console.error('sendPhase5Notifications error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});