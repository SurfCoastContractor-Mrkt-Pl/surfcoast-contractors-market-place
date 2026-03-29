import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, difficulty = 'medium' } = await req.json();

    if (!gameId) {
      return Response.json({ error: 'gameId is required' }, { status: 400 });
    }

    // Get current user's stats
    const userTiers = await base44.entities.GameRewardTier.filter({
      contractor_email: user.email
    });
    const userTier = userTiers[0];
    const userPoints = userTier?.tier_points || 0;

    // Get all players who completed this game with same difficulty
    const sessions = await base44.entities.UserGameSession.filter({
      trade_game_id: gameId,
      difficulty_level: difficulty,
      is_solved: true
    });

    if (!sessions || sessions.length === 0) {
      return Response.json({ recommendedOpponents: [] });
    }

    // Calculate skill based on average score
    const playerStats = {};
    sessions.forEach(session => {
      if (session.user_email !== user.email) {
        if (!playerStats[session.user_email]) {
          playerStats[session.user_email] = {
            totalScore: 0,
            count: 0,
            name: session.user_email,
            bestScore: 0
          };
        }
        playerStats[session.user_email].totalScore += session.score || 0;
        playerStats[session.user_email].count += 1;
        playerStats[session.user_email].bestScore = Math.max(
          playerStats[session.user_email].bestScore,
          session.score || 0
        );
      }
    });

    // Get average score for current user
    const userSessions = sessions.filter(s => s.user_email === user.email);
    const userAvgScore = userSessions.length > 0
      ? userSessions.reduce((sum, s) => sum + (s.score || 0), 0) / userSessions.length
      : 0;

    // Find closest matches (within 10-30 points)
    const recommendations = Object.entries(playerStats)
      .map(([email, stats]) => ({
        email,
        name: stats.name,
        avgScore: Math.round(stats.totalScore / stats.count),
        bestScore: stats.bestScore,
        skillGap: Math.abs((stats.totalScore / stats.count) - userAvgScore)
      }))
      .filter(p => p.skillGap <= 30) // Only players within 30-point skill gap
      .sort((a, b) => a.skillGap - b.skillGap)
      .slice(0, 5); // Top 5 recommendations

    console.info(`[recommendCompetitiveMatches] Found ${recommendations.length} matches for ${user.email} in ${gameId}`);

    return Response.json({
      success: true,
      userAvgScore: Math.round(userAvgScore),
      recommendedOpponents: recommendations
    });
  } catch (error) {
    console.error('[recommendCompetitiveMatches] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});