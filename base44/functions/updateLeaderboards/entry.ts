import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Allow: (1) automation event payload, (2) internal service key, (3) admin user
    const isAutomation = !!(body.event && body.event.type);
    const internalKey = req.headers.get('x-internal-service-key') || body.internal_service_key;
    const validInternalKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    const hasValidServiceKey = validInternalKey && internalKey === validInternalKey;

    if (!isAutomation && !hasValidServiceKey) {
      // Fall back to checking for an authenticated admin user
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        console.warn('[updateLeaderboards] Unauthorized access attempt blocked');
        return Response.json({ error: 'Forbidden: Admin access or internal service key required' }, { status: 403 });
      }
    }

    const { gameId } = body;

    // If a specific gameId is provided, process just that game; otherwise process all games
    const games = gameId
      ? [await base44.asServiceRole.entities.TradeGame.get(gameId)].filter(Boolean)
      : await base44.asServiceRole.entities.TradeGame.list();

    if (!games || games.length === 0) {
      return Response.json({ success: true, message: 'No games found', gamesProcessed: 0 });
    }

    const processGame = async (game) => {
      const allSessions = await base44.asServiceRole.entities.UserGameSession.filter({
        trade_game_id: game.id,
        is_solved: true
      }, '-score', 1000);

      // Clear old leaderboard entries for this game
      const oldEntries = await base44.asServiceRole.entities.GameLeaderboard.filter({
        trade_game_id: game.id
      }, null, 10000);
      for (const entry of oldEntries) {
        await base44.asServiceRole.entities.GameLeaderboard.delete(entry.id);
      }

      const newEntries = [];
      for (const difficulty of ['easy', 'medium', 'hard']) {
        const sessions = allSessions.filter(s => s.difficulty_level === difficulty);
        const playerBests = {};
        sessions.forEach(session => {
          if (!playerBests[session.user_email]) {
            playerBests[session.user_email] = {
              email: session.user_email,
              name: session.user_email.split('@')[0],
              type: session.user_type,
              score: session.score || 0,
              time: session.duration_seconds || 0,
              completions: 0,
              lastCompleted: session.end_time
            };
          } else {
            if (session.score > playerBests[session.user_email].score) {
              playerBests[session.user_email].score = session.score;
              playerBests[session.user_email].time = session.duration_seconds || 0;
            }
            playerBests[session.user_email].completions++;
            if (new Date(session.end_time) > new Date(playerBests[session.user_email].lastCompleted)) {
              playerBests[session.user_email].lastCompleted = session.end_time;
            }
          }
        });

        const sorted = Object.values(playerBests).sort((a, b) => b.score - a.score);
        for (let i = 0; i < sorted.length && i < 50; i++) {
          const player = sorted[i];
          newEntries.push({
            trade_game_id: game.id,
            game_title: game.title,
            difficulty,
            rank: i + 1,
            player_email: player.email,
            player_name: player.name,
            player_type: player.type,
            score: player.score,
            completion_time: player.time,
            completions: player.completions,
            last_completed_at: player.lastCompleted,
            updated_at: new Date().toISOString()
          });
        }
      }

      if (newEntries.length > 0) {
        await base44.asServiceRole.entities.GameLeaderboard.bulkCreate(newEntries);
      }
      console.log(`[updateLeaderboards] Game "${game.title}": ${newEntries.length} entries created`);
      return newEntries.length;
    };

    let totalEntries = 0;
    for (const game of games) {
      totalEntries += await processGame(game);
    }

    console.log(`[updateLeaderboards] Done. ${games.length} games processed, ${totalEntries} total entries created`);

    return Response.json({
      success: true,
      gamesProcessed: games.length,
      totalEntriesCreated: totalEntries
    });
  } catch (error) {
    console.error('[updateLeaderboards] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});