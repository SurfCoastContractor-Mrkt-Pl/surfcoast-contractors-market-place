import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sessions for user
    const sessions = await base44.entities.UserGameSession.filter({
      user_email: user.email
    });

    if (sessions.length === 0) {
      return Response.json({ analytics: [] });
    }

    // Group by game
    const gameStats = {};

    sessions.forEach(session => {
      const gameId = session.trade_game_id;
      if (!gameStats[gameId]) {
        gameStats[gameId] = {
          game_id: gameId,
          game_title: session.trade_game_id,
          difficulty: session.difficulty_level,
          total_sessions: 0,
          completed_sessions: 0,
          scores: [],
          completion_times: [],
          last_played: session.start_time
        };
      }

      gameStats[gameId].total_sessions++;
      if (session.is_solved) {
        gameStats[gameId].completed_sessions++;
        gameStats[gameId].scores.push(session.score || 0);
        gameStats[gameId].completion_times.push(session.duration_seconds || 0);
      }
      gameStats[gameId].last_played = new Date(session.start_time) > new Date(gameStats[gameId].last_played)
        ? session.start_time
        : gameStats[gameId].last_played;
    });

    // Calculate analytics for each game
    const analytics = [];
    for (const gameId in gameStats) {
      const stats = gameStats[gameId];
      const completionRate = (stats.completed_sessions / stats.total_sessions) * 100;
      const avgScore = stats.scores.length > 0 ? Math.round(stats.scores.reduce((a, b) => a + b) / stats.scores.length) : 0;
      const bestScore = stats.scores.length > 0 ? Math.max(...stats.scores) : 0;
      const worstScore = stats.scores.length > 0 ? Math.min(...stats.scores) : 0;
      const avgTime = stats.completion_times.length > 0
        ? Math.round(stats.completion_times.reduce((a, b) => a + b) / stats.completion_times.length)
        : 0;
      const bestTime = stats.completion_times.length > 0 ? Math.min(...stats.completion_times) : 0;

      // Calculate consistency (standard deviation)
      const variance = stats.scores.length > 1
        ? stats.scores.reduce((sum, score) => sum + Math.pow(score - avgScore, 2), 0) / stats.scores.length
        : 0;
      const stdDev = Math.sqrt(variance);
      const consistency = Math.max(0, 100 - (stdDev / avgScore * 100));

      // Calculate improvement (first 5 vs last 5 sessions)
      const sortedByDate = sessions
        .filter(s => s.trade_game_id === gameId && s.is_solved)
        .sort((a, b) => new Date(a.start_time) - new Date(b.start_time));

      let improvementRate = 0;
      if (sortedByDate.length >= 10) {
        const firstFive = sortedByDate.slice(0, 5).map(s => s.score || 0);
        const lastFive = sortedByDate.slice(-5).map(s => s.score || 0);
        const firstAvg = firstFive.reduce((a, b) => a + b) / firstFive.length;
        const lastAvg = lastFive.reduce((a, b) => a + b) / lastFive.length;
        improvementRate = ((lastAvg - firstAvg) / firstAvg) * 100;
      }

      const analyticsEntry = {
        user_email: user.email,
        trade_game_id: gameId,
        game_title: stats.game_title,
        difficulty: stats.difficulty,
        total_sessions: stats.total_sessions,
        completed_sessions: stats.completed_sessions,
        completion_rate: Math.round(completionRate),
        avg_score: avgScore,
        best_score: bestScore,
        worst_score: worstScore,
        avg_completion_time: avgTime,
        best_completion_time: bestTime,
        consistency_score: Math.round(consistency),
        improvement_rate: Math.round(improvementRate),
        last_played: stats.last_played,
        updated_at: new Date().toISOString()
      };

      // Upsert analytics
      const existing = await base44.entities.GamePerformanceAnalytics.filter({
        user_email: user.email,
        trade_game_id: gameId
      }).then(results => results[0] || null);

      if (existing) {
        await base44.entities.GamePerformanceAnalytics.update(existing.id, analyticsEntry);
      } else {
        await base44.entities.GamePerformanceAnalytics.create(analyticsEntry);
      }

      analytics.push(analyticsEntry);
    }

    console.info(`[aggregateGameAnalytics] ${user.email}: analytics updated for ${analytics.length} games`);

    return Response.json({
      success: true,
      userEmail: user.email,
      gamesAnalyzed: analytics.length,
      analytics
    });
  } catch (error) {
    console.error('[aggregateGameAnalytics] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});