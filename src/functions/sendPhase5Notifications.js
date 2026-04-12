import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  let base44 = null;
  let user = null;

  try {
    base44 = createClientFromRequest(req);
    user = await base44.auth.me();

    // Authentication check
    if (!user) {
      return Response.json(
        { error: 'Authentication required. Please log in to proceed.', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Authorization check - admin only
    if (user.role !== 'admin') {
      return Response.json(
        { error: 'Admin access required. You do not have permission to send notifications.', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { recipientEmail, notificationType, projectId, message, metadata } = body;

    // Validate required fields
    if (!recipientEmail || !notificationType || !projectId) {
      return Response.json(
        { error: 'Missing required fields: recipientEmail, notificationType, and projectId.', code: 'BAD_REQUEST' },
        { status: 400 }
      );
    }

    // Validate notification type
    const allowedTypes = ['project_update', 'milestone_complete', 'message', 'collaboration_invite'];
    if (!allowedTypes.includes(notificationType)) {
      return Response.json(
        { 
          error: `Invalid notification type. Allowed types: ${allowedTypes.join(', ')}`,
          code: 'BAD_REQUEST'
        },
        { status: 400 }
      );
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
    }).catch((err) => {
      console.error('Failed to create notification record:', err.message);
      return null;
    });

    return Response.json({ 
      success: true, 
      id: notificationRecord?.id || null,
      message: 'Notification queued for delivery'
    });
  } catch (error) {
    console.error('[sendPhase5Notifications] Error:', error.message, error.stack);

    // Log error to ErrorLog entity for monitoring
    if (base44) {
      try {
        await base44.asServiceRole.entities.ErrorLog.create({
          message: error.message || 'Unknown error in sendPhase5Notifications',
          stack: error.stack || '',
          level: 'error',
          type: 'sendPhase5Notifications',
          metadata: {
            userId: user?.email || 'anonymous',
            timestamp: new Date().toISOString(),
            errorType: error.constructor.name
          }
        }).catch(() => {
          // Silently fail if ErrorLog creation fails
        });
      } catch (logError) {
        console.error('[sendPhase5Notifications] Failed to log error:', logError.message);
      }
    }

    // Return user-friendly error response
    return Response.json(
      { 
        error: 'An unexpected server error occurred. Please try again later.',
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
});