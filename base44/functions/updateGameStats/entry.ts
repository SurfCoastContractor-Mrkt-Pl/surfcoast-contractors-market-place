import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const internalKey = req.headers.get('x-internal-service-key');
    const user = internalKey ? null : await base44.auth.me().catch(() => null);
    if (!internalKey || internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { game_id, session_id } = await req.json();

    if (!game_id) {
      return Response.json({ error: 'Game ID required' }, { status: 400 });
    }

    // Get all sessions for this game
    const sessions = await base44.asServiceRole.entities.UserGameSession.filter({
      trade_game_id: game_id
    });

    if (sessions.length === 0) {
      return Response.json({ success: true, updated: false });
    }

    // Calculate stats
    const completedSessions = sessions.filter(s => s.is_solved).length;
    const scores = sessions.filter(s => s.score).map(s => s.score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
    const bestScore = Math.max(...scores, 0);

    const durations = sessions.filter(s => s.duration_seconds).map(s => s.duration_seconds);
    const avgTime = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 0;

    // Update game
    await base44.asServiceRole.entities.TradeGame.update(game_id, {
      play_count: sessions.length,
      average_completion_time: avgTime,
      average_score: avgScore
    });

    console.info(`[updateGameStats] Updated game ${game_id}: ${sessions.length} plays, ${avgScore} avg score, ${avgTime}s avg time`);

    return Response.json({
      success: true,
      stats: {
        play_count: sessions.length,
        completed_sessions: completedSessions,
        average_score: avgScore,
        average_completion_time: avgTime,
        best_score: bestScore
      }
    });
  } catch (error) {
    console.error('[updateGameStats] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});