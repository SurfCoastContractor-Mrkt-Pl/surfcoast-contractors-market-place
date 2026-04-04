import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Scheduled daily leaderboard update.
 * Fetches all published games and rebuilds their leaderboards.
 * Called by the daily automation.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow internal service key OR admin auth
    const internalKey = req.headers.get('x-internal-service-key');
    if (!internalKey || internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Fetch all published games
    const games = await base44.asServiceRole.entities.TradeGame.filter(
      { is_published: true },
      null,
      200
    );

    if (games.length === 0) {
      return Response.json({ success: true, message: 'No published games to update', updated: 0 });
    }

    const results = [];
    for (const game of games) {
      try {
        const res = await base44.asServiceRole.functions.invoke('updateLeaderboards', {
          gameId: game.id
        });
        results.push({ gameId: game.id, title: game.title, status: 'ok', entries: res?.entriesCreated ?? 0 });
      } catch (err) {
        console.error(`[scheduledLeaderboardUpdate] Failed for game ${game.id}:`, err.message);
        results.push({ gameId: game.id, title: game.title, status: 'error', error: err.message });
      }
    }

    const succeeded = results.filter(r => r.status === 'ok').length;
    console.info(`[scheduledLeaderboardUpdate] Updated ${succeeded}/${games.length} games`);

    return Response.json({
      success: true,
      total_games: games.length,
      updated: succeeded,
      results
    });
  } catch (error) {
    console.error('[scheduledLeaderboardUpdate] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});