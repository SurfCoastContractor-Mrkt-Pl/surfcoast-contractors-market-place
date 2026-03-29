import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, difficulty, gameTitle, opponentEmail } = await req.json();

    if (!gameId || !gameTitle || !opponentEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Prevent self-challenge
    if (opponentEmail === user.email) {
      return Response.json({ error: 'Cannot challenge yourself' }, { status: 400 });
    }

    // Check if opponent exists (via reward tier)
    const opponents = await base44.entities.GameRewardTier.filter({
      contractor_email: opponentEmail
    });

    if (!opponents || opponents.length === 0) {
      return Response.json({ error: 'Opponent not found' }, { status: 404 });
    }

    // Create competitive match
    const match = await base44.entities.GameCompetitiveMatch.create({
      challenge_initiator_email: user.email,
      challenge_initiator_name: user.full_name || user.email,
      opponent_email: opponentEmail,
      opponent_name: opponents[0]?.contractor_email || opponentEmail,
      trade_game_id: gameId,
      game_title: gameTitle,
      difficulty: difficulty || 'medium',
      status: 'pending',
      created_at: new Date().toISOString()
    });

    console.info(`[createCompetitiveMatch] Match created: ${user.email} vs ${opponentEmail} for ${gameId}`);

    return Response.json({
      success: true,
      match: match
    });
  } catch (error) {
    console.error('[createCompetitiveMatch] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});