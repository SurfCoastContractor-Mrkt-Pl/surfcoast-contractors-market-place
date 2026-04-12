import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ratings = await base44.entities.SwapMeetLocationRating.filter(
      { rater_email: user.email },
      '-created_date',
      100
    );

    return Response.json({
      user_email: user.email,
      total_ratings: ratings.length,
      ratings: ratings
    });
  } catch (error) {
    console.error('Error fetching user ratings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});