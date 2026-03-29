import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId } = await req.json();

    if (!gameId) {
      return Response.json({ error: 'gameId is required' }, { status: 400 });
    }

    // Get user's game sessions for this game
    const sessions = await base44.entities.UserGameSession.filter({
      user_email: user.email,
      trade_game_id: gameId
    });

    if (sessions.length === 0) {
      return Response.json({ error: 'No sessions found for this game' }, { status: 404 });
    }

    // Calculate performance metrics
    const solvedSessions = sessions.filter(s => s.is_solved);
    const completionRate = (solvedSessions.length / sessions.length) * 100;
    const avgScore = solvedSessions.length > 0
      ? Math.round(solvedSessions.reduce((sum, s) => sum + (s.score || 0), 0) / solvedSessions.length)
      : 0;
    const bestScore = Math.max(...sessions.map(s => s.score || 0));

    // Identify weak areas based on performance
    const weakAreas = completionRate < 50
      ? ['puzzle_solving', 'spatial_reasoning', 'logic']
      : completionRate < 75
        ? ['time_management', 'precision', 'efficiency']
        : ['advanced_techniques', 'optimization'];

    // Use AI to analyze and generate recommendations
    const analysisPrompt = `
User Performance Analysis:
- Game: ${(await base44.entities.TradeGame.get(gameId))?.title || 'Unknown'}
- Completion Rate: ${completionRate.toFixed(1)}%
- Average Score: ${avgScore}
- Best Score: ${bestScore}
- Weak Areas: ${weakAreas.join(', ')}

Generate a detailed analysis of performance gaps and recommend specific game types/difficulties to improve. Provide specific actionable recommendations.
    `;

    const analysis = await base44.integrations.Core.InvokeLLM({
      prompt: analysisPrompt
    });

    // Get all available games
    const allGames = await base44.entities.TradeGame.filter({ is_published: true });

    // Use AI to recommend games
    const recommendationPrompt = `
Based on this performance analysis:
${analysis}

Recommend 5 specific games from this list that would best help improve the identified weak areas:
${allGames.map(g => `- ${g.title} (${g.difficulty}, ${g.trade_type})`).join('\n')}

For each recommendation, provide: game_id, reason for recommendation, and priority (1-5, 5 being highest).
Return as JSON array.
    `;

    const recommendationsText = await base44.integrations.Core.InvokeLLM({
      prompt: recommendationPrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                game_id: { type: 'string' },
                game_title: { type: 'string' },
                reason: { type: 'string' },
                priority: { type: 'number' }
              }
            }
          }
        }
      }
    });

    // Create tutoring session
    const tutorSession = await base44.entities.AITutoringSession.create({
      user_email: user.email,
      user_type: user.role === 'admin' ? 'contractor' : 'client',
      trade_game_id: gameId,
      game_title: (await base44.entities.TradeGame.get(gameId))?.title || 'Unknown',
      difficulty: (await base44.entities.TradeGame.get(gameId))?.difficulty || 'medium',
      performance_metrics: {
        average_score: avgScore,
        best_score: bestScore,
        completion_rate: completionRate,
        weak_areas: weakAreas,
        strengths: completionRate > 75 ? ['consistency', 'learning_ability'] : []
      },
      ai_analysis: analysis,
      recommended_games: recommendationsText.recommendations || [],
      focus_areas: weakAreas,
      started_at: new Date().toISOString(),
      improvement_target: Math.min(25, 100 - completionRate)
    });

    console.info(`[generateGameRecommendations] Created tutoring session for ${user.email}`);

    return Response.json({
      success: true,
      sessionId: tutorSession.id,
      analysis,
      recommendations: recommendationsText.recommendations || [],
      focusAreas: weakAreas
    });
  } catch (error) {
    console.error('[generateGameRecommendations] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});