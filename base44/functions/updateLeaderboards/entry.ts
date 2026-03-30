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

    const body = await req.json();
    const { gameId } = body;

    if (!gameId) {
      return Response.json({ error: 'gameId is required' }, { status: 400 });
    }

    // Get the game
    const game = await base44.asServiceRole.entities.TradeGame.get(gameId);
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get all completed sessions for this game, grouped by difficulty
    const allSessions = await base44.asServiceRole.entities.UserGameSession.filter({
      trade_game_id: gameId,
      is_solved: true
    }, '-score', 1000);

    // Group sessions by difficulty
    const byDifficulty = {};
    ['easy', 'medium', 'hard'].forEach(diff => {
      byDifficulty[diff] = allSessions.filter(s => s.difficulty_level === diff);
    });

    // Clear old leaderboard entries for this game
    const oldEntries = await base44.asServiceRole.entities.GameLeaderboard.filter({
      trade_game_id: gameId
    }, null, 10000);
    
    for (const entry of oldEntries) {
      await base44.asServiceRole.entities.GameLeaderboard.delete(entry.id);
    }

    // Build new leaderboards for each difficulty
    const newEntries = [];
    
    for (const [difficulty, sessions] of Object.entries(byDifficulty)) {
      // Group by player and get best score per player
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

      // Sort by score (descending) and create leaderboard entries
      const sorted = Object.values(playerBests).sort((a, b) => b.score - a.score);
      
      for (let i = 0; i < sorted.length && i < 50; i++) {
        const player = sorted[i];
        newEntries.push({
          trade_game_id: gameId,
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

    // Create new leaderboard entries
    if (newEntries.length > 0) {
      await base44.asServiceRole.entities.GameLeaderboard.bulkCreate(newEntries);
    }

    console.log(`[updateLeaderboards] Updated leaderboard for game ${gameId}: ${newEntries.length} entries created`);

    return Response.json({
      success: true,
      game: game.title,
      entriesCreated: newEntries.length,
      byDifficulty: {
        easy: newEntries.filter(e => e.difficulty === 'easy').length,
        medium: newEntries.filter(e => e.difficulty === 'medium').length,
        hard: newEntries.filter(e => e.difficulty === 'hard').length
      }
    });
  } catch (error) {
    console.error('[updateLeaderboards] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});