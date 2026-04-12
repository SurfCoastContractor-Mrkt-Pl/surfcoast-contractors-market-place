import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { ratingId, action, reason } = await req.json();

    if (!ratingId || !['approve', 'reject', 'flag'].includes(action)) {
      return Response.json({ error: 'Invalid request' }, { status: 400 });
    }

    const rating = await base44.entities.SwapMeetLocationRating.filter({ id: ratingId });

    if (!rating.length) {
      return Response.json({ error: 'Rating not found' }, { status: 404 });
    }

    await base44.entities.SwapMeetLocationRating.update(ratingId, {
      moderation_status: action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'flagged',
      moderation_reason: reason,
      moderated_at: new Date().toISOString(),
      moderated_by: user.email,
    });

    return Response.json({
      message: `Rating ${action}ed successfully`,
      rating_id: ratingId
    });
  } catch (error) {
    console.error('Error moderating rating:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});