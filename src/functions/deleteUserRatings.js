import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ratingIds } = await req.json();

    if (!Array.isArray(ratingIds) || ratingIds.length === 0) {
      return Response.json({ error: 'Rating IDs required' }, { status: 400 });
    }

    const ratings = await base44.entities.SwapMeetLocationRating.filter({
      rater_email: user.email
    });

    const userRatingIds = new Set(ratings.map(r => r.id));
    const deleteIds = ratingIds.filter(id => userRatingIds.has(id));

    for (const id of deleteIds) {
      await base44.entities.SwapMeetLocationRating.delete(id);
    }

    return Response.json({
      deleted_count: deleteIds.length,
      message: `Deleted ${deleteIds.length} rating(s)`
    });
  } catch (error) {
    console.error('Error deleting user ratings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});