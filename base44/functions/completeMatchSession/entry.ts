import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, finalScore, duration } = await req.json();

    if (!matchId || finalScore === undefined) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const match = await base44.entities.GameCompetitiveMatch.get(matchId);
    if (!match) {
      return Response.json({ error: 'Match not found' }, { status: 404 });
    }

    // Verify user is participant
    if (user.email !== match.challenge_initiator_email && user.email !== match.opponent_email) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const isInitiator = user.email === match.challenge_initiator_email;
    const initiatorScore = isInitiator ? finalScore : match.initiator_score;
    const opponentScore = isInitiator ? match.opponent_score : finalScore;
    const winner = initiatorScore > opponentScore ? match.challenge_initiator_email : match.opponent_email;

    // Complete match
    const completed = await base44.entities.GameCompetitiveMatch.update(matchId, {
      status: 'completed',
      completed_at: new Date().toISOString(),
      match_duration_seconds: duration || 0,
      initiator_score: initiatorScore,
      opponent_score: opponentScore,
      winner_email: winner,
      initiator_prize_earned: initiatorScore > opponentScore ? 10 : 5,
      opponent_prize_earned: opponentScore > initiatorScore ? 10 : 5
    });

    // Notify both players
    const notificationData = {
      match_id: matchId,
      game_title: match.game_title,
      action_url: `/match/${matchId}`,
      metadata: { initiatorScore, opponentScore, winner }
    };

    await base44.entities.MatchNotification.create({
      recipient_email: match.opponent_email,
      notification_type: 'match_completed',
      title: 'Match Complete!',
      message: `Match finished. ${winner === match.challenge_initiator_email ? 'Opponent' : 'You'} won with ${winner === match.challenge_initiator_email ? initiatorScore : opponentScore} points!`,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      ...notificationData
    });

    console.info(`[completeMatchSession] Match ${matchId} completed. Winner: ${winner}`);

    return Response.json({
      success: true,
      matchId,
      winner,
      initiatorScore,
      opponentScore
    });
  } catch (error) {
    console.error('[completeMatchSession] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});