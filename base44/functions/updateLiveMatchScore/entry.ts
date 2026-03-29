import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, score, timeElapsed } = await req.json();

    if (!matchId || score === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the match
    const match = await base44.entities.GameCompetitiveMatch.get(matchId);
    if (!match) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify user is participant
    if (user.email !== match.challenge_initiator_email && user.email !== match.opponent_email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Determine who is updating
    const isInitiator = user.email === match.challenge_initiator_email;
    const updateData = isInitiator
      ? { initiator_score: score }
      : { opponent_score: score };

    // Update match with new score
    await base44.entities.GameCompetitiveMatch.update(matchId, {
      ...updateData,
      status: 'in_progress'
    });

    // Create notification for opponent
    const opponentEmail = isInitiator ? match.opponent_email : match.challenge_initiator_email;
    const leaderMessage = score > (isInitiator ? match.opponent_score : match.initiator_score)
      ? 'you_lead'
      : 'opponent_lead';

    await base44.entities.MatchNotification.create({
      recipient_email: opponentEmail,
      match_id: matchId,
      notification_type: 'opponent_progress',
      title: `${user.full_name || user.email} scored ${score}!`,
      message: `Your opponent just scored ${score} in ${match.game_title}`,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      game_title: match.game_title,
      action_url: `/match/${matchId}`,
      metadata: { newScore: score, playerRole: isInitiator ? 'initiator' : 'opponent' }
    });

    console.info(`[updateLiveMatchScore] Match ${matchId}: ${user.email} scored ${score}`);

    return Response.json({
      success: true,
      matchId,
      updatedScore: score
    });
  } catch (error) {
    console.error('[updateLiveMatchScore] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});