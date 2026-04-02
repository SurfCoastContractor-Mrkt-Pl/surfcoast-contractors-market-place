import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      otherPartyEmail,
      otherPartyName,
      scheduledAt,
      durationMinutes = 30,
      jobId,
    } = await req.json();

    if (!otherPartyEmail || !scheduledAt) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique room ID
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create video session
    const session = await base44.entities.VideoSession.create({
      contractor_email: user.email,
      client_email: otherPartyEmail,
      contractor_name: user.full_name,
      client_name: otherPartyName,
      scheduled_at: scheduledAt,
      duration_minutes: durationMinutes,
      room_id: roomId,
      job_id: jobId,
      status: 'scheduled',
    });

    // Send notifications
    await base44.integrations.Core.SendEmail({
      to: otherPartyEmail,
      subject: `Video Consultation Scheduled with ${user.full_name}`,
      body: `You have a video consultation scheduled for ${new Date(scheduledAt).toLocaleString()}. Click the link to join: [Join Video Call](${Deno.env.get('APP_URL')}/video/${roomId})`,
    });

    return Response.json({ session, roomId });
  } catch (error) {
    console.error('Create video session error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});