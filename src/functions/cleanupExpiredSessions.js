import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Only allow service role or scheduled executions
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Clean up expired timed chat sessions
    const expiredSessions = await base44.asServiceRole.entities.TimedChatSession.filter({
      session_expires_at: { $lt: now }
    });

    let deletedCount = 0;
    for (const session of expiredSessions) {
      await base44.asServiceRole.entities.TimedChatSession.delete(session.id);
      deletedCount++;
    }

    // Log cleanup activity
    await base44.asServiceRole.entities.ActivityLog.create({
      action_type: 'delete',
      entity_type: 'system',
      description: `Cleaned up ${deletedCount} expired chat sessions`,
      severity: 'low',
      status: 'success',
    });

    return Response.json({ success: true, cleaned: deletedCount });
  } catch (error) {
    console.error('Error in cleanupExpiredSessions:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});