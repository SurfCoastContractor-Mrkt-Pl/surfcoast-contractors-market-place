import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { gameId, sessionId } = await req.json();

    if (!gameId || !sessionId) {
      return Response.json(
        { error: 'Missing required fields: gameId, sessionId' },
        { status: 400 }
      );
    }

    // Fetch the completed session
    const session = await base44.asServiceRole.entities.UserGameSession.get(sessionId);
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Fetch the game
    const game = await base44.asServiceRole.entities.TradeGame.get(gameId);
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // Get all sessions for this game
    const allSessions = await base44.asServiceRole.entities.UserGameSession.filter(
      { trade_game_id: gameId, is_solved: true },
      '-created_date',
      1000
    );

    // Calculate statistics
    const playCount = allSessions.length + 1;
    const totalScore = allSessions.reduce((sum, s) => sum + (s.score || 0), 0) + (session.score || 0);
    const averageScore = Math.round(totalScore / playCount);
    
    const totalDuration = allSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) + (session.duration_seconds || 0);
    const averageCompletionTime = Math.round(totalDuration / playCount);

    // Update game statistics
    await base44.asServiceRole.entities.TradeGame.update(gameId, {
      play_count: playCount,
      average_score: averageScore,
      average_completion_time: averageCompletionTime
    });

    console.log(
      `Game ${gameId} stats updated: plays=${playCount}, avg_score=${averageScore}, avg_time=${averageCompletionTime}s`
    );

    return Response.json({
      success: true,
      playCount,
      averageScore,
      averageCompletionTime
    });
  } catch (error) {
    console.error('Error updating game statistics:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});