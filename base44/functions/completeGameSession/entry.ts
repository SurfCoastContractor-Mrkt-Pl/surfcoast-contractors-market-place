import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, scopeId, moves, duration, gameMode, finalState } = await req.json();

    if (!gameId) {
      return Response.json(
        { error: 'Missing required fields: gameId' },
        { status: 400 }
      );
    }

    // Fetch game details
    const game = await base44.entities.TradeGame.get(gameId);
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // SERVER-SIDE score calculation — never trust client-provided score
    // Score is derived from moves count and time taken, bounded 0–100
    const maxMoves = game.max_moves || 50;
    const actualMoves = Math.max(1, moves || maxMoves);
    const efficiency = Math.max(0, 1 - (actualMoves - 1) / maxMoves);
    const serverScore = Math.round(efficiency * 100);

    console.log(`[completeGameSession] Server-calculated score: ${serverScore} (moves: ${actualMoves})`);

    // Calculate discount based on difficulty and server-calculated performance
    let discountPercentage = 0;
    if (serverScore >= 80) {
      discountPercentage =
        game.difficulty === 'hard' ? 15 : game.difficulty === 'medium' ? 10 : 5;
    } else if (serverScore >= 60) {
      discountPercentage = game.difficulty === 'hard' ? 10 : game.difficulty === 'medium' ? 7 : 3;
    } else if (serverScore >= 40) {
      discountPercentage = 2;
    }

    // Create game session record
    const session = await base44.entities.UserGameSession.create({
      user_email: user.email,
      user_type: 'contractor',
      trade_game_id: gameId,
      scope_of_work_id: scopeId || null,
      contractor_email: user.email,
      current_state_json: JSON.stringify(finalState || {}),
      start_time: new Date(Date.now() - (duration || 0) * 1000).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: duration || 0,
      score: serverScore,
      moves_count: actualMoves,
      is_solved: serverScore >= 40,
      discount_earned: discountPercentage > 0,
      discount_percentage: discountPercentage,
      game_mode_played: gameMode || 'guided_puzzle'
    });

    console.log(`Game session created: ${session.id}, discount: ${discountPercentage}%`);

    // Update leaderboards, calculate reward tier, and sync to HubSpot
    try {
      await base44.asServiceRole.functions.invoke('updateLeaderboards', {
        gameId: gameId
      });
      
      // Calculate and update reward tier
      try {
        await base44.asServiceRole.functions.invoke('calculateGameRewardTier', {
          contractorEmail: user.email
        });
      } catch (tierErr) {
        console.warn('[completeGameSession] Reward tier calculation warning:', tierErr.message);
      }
      
      // Sync game completion to HubSpot CRM
      try {
        await base44.asServiceRole.functions.invoke('syncGameCompletionToHubSpot', {
          sessionData: { score: serverScore, discount_earned: discountPercentage > 0, discount_percentage: discountPercentage },
          gameData: { title: game.title, difficulty: game.difficulty },
          userData: { email: user.email, full_name: user.full_name }
        });
      } catch (hubspotErr) {
        console.warn('[completeGameSession] HubSpot sync warning:', hubspotErr.message);
      }
    } catch (err) {
      console.error('[completeGameSession] Error updating leaderboards:', err.message);
    }

    // If a scope is provided, apply the discount
    if (scopeId) {
      const scope = await base44.entities.ScopeOfWork.get(scopeId);
      if (scope) {
        // Store original cost if not already stored
        const originalCost = scope.original_cost_amount || scope.cost_amount;

        // Calculate discounted cost
        const discountedCost = originalCost * (1 - discountPercentage / 100);

        // Update scope with discount
        await base44.entities.ScopeOfWork.update(scopeId, {
          game_session_id: session.id,
          game_discount_percentage: discountPercentage,
          game_discount_applied: true,
          original_cost_amount: originalCost,
          cost_amount: discountedCost
        });

        console.log(
          `Discount applied to scope ${scopeId}: $${originalCost} -> $${discountedCost.toFixed(
            2
          )}`
        );
      }
    }

    return Response.json({
      success: true,
      sessionId: session.id,
      discount: discountPercentage,
      score: serverScore,
      message: `Congratulations! You earned a ${discountPercentage}% discount.`
    });
  } catch (error) {
    console.error('Error in completeGameSession:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});