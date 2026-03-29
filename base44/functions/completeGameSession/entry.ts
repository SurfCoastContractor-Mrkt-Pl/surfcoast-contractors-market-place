import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, scopeId, score, moves, duration, gameMode } = await req.json();

    if (!gameId || !score) {
      return Response.json(
        { error: 'Missing required fields: gameId, score' },
        { status: 400 }
      );
    }

    // Fetch game details
    const game = await base44.entities.TradeGame.get(gameId);
    if (!game) {
      return Response.json({ error: 'Game not found' }, { status: 404 });
    }

    // Calculate discount based on difficulty and performance
    let discountPercentage = 0;
    if (score >= 80) {
      discountPercentage =
        game.difficulty === 'hard' ? 15 : game.difficulty === 'medium' ? 10 : 5;
    } else if (score >= 60) {
      discountPercentage = game.difficulty === 'hard' ? 10 : game.difficulty === 'medium' ? 7 : 3;
    } else if (score >= 40) {
      discountPercentage = 2;
    }

    // Create game session record
    const session = await base44.entities.UserGameSession.create({
      user_email: user.email,
      user_type: 'contractor', // Default to contractor; can be overridden in payload
      trade_game_id: gameId,
      scope_of_work_id: scopeId || null,
      contractor_email: user.email,
      current_state_json: JSON.stringify({}),
      start_time: new Date(Date.now() - (duration || 0) * 1000).toISOString(),
      end_time: new Date().toISOString(),
      duration_seconds: duration || 0,
      score: score,
      moves_count: moves || 0,
      is_solved: score >= 40,
      discount_earned: discountPercentage > 0,
      discount_percentage: discountPercentage,
      game_mode_played: gameMode || 'guided_puzzle'
    });

    console.log(`Game session created: ${session.id}, discount: ${discountPercentage}%`);

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
      message: `Congratulations! You earned a ${discountPercentage}% discount.`
    });
  } catch (error) {
    console.error('Error in completeGameSession:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});