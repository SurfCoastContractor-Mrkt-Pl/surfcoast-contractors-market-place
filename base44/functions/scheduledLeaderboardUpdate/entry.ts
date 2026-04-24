import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Scheduled daily leaderboard update.
 * Fetches all published games and rebuilds their leaderboards.
 * Called by the daily automation.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Scheduled automation — must be triggered by platform or INTERNAL_SERVICE_KEY only.
    // Do NOT attempt base44.auth.me() here — scheduled tasks have no user session.
    const serviceKey = req.headers.get('x-internal-key');
    const isPlatformAutomation = !!req.headers.get('x-automation-id');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!isPlatformAutomation && !validServiceKey) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // This is a scheduled automation — no user session is available, run as service role directly.
    // Fetch all published games and rebuild their leaderboards inline.
    const games = await base44.asServiceRole.entities.TradeGame.filter(
      { is_published: true },
      null,
      200
    );

    if (games.length === 0) {
      return Response.json({ success: true, message: 'No published games to update', updated: 0 });
    }

    let totalEntries = 0;
    const results = [];

    for (const game of games) {
      try {
        const allSessions = await base44.asServiceRole.entities.UserGameSession.filter({
          trade_game_id: game.id,
          is_solved: true
        }, '-score', 1000);

        const oldEntries = await base44.asServiceRole.entities.GameLeaderboard.filter(
          { trade_game_id: game.id }, null, 10000
        );
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
                name: session.user_email?.split('@')[0] || 'unknown',
                type: session.user_type,
                score: session.score || 0,
                time: session.duration_seconds || 0,
                completions: 1,
                lastCompleted: session.end_time
              };
            } else {
              if ((session.score || 0) > playerBests[session.user_email].score) {
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

        totalEntries += newEntries.length;
        results.push({ gameId: game.id, title: game.title, status: 'ok', entries: newEntries.length });
        console.log(`[scheduledLeaderboardUpdate] Game "${game.title}": ${newEntries.length} entries`);
      } catch (err) {
        console.error(`[scheduledLeaderboardUpdate] Failed for game ${game.id}:`, err.message);
        results.push({ gameId: game.id, title: game.title, status: 'error', error: err.message });
      }
    }

    const succeeded = results.filter(r => r.status === 'ok').length;
    console.info(`[scheduledLeaderboardUpdate] Done. ${succeeded}/${games.length} games, ${totalEntries} total entries`);

    return Response.json({
      success: true,
      total_games: games.length,
      updated: succeeded,
      total_entries: totalEntries,
      results
    });
  } catch (error) {
    console.error('[scheduledLeaderboardUpdate] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});