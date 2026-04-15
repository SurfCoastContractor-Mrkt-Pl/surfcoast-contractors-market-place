import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { challenge_token, score } = await req.json();

    if (!challenge_token) {
      return Response.json({ error: 'Challenge token required' }, { status: 400 });
    }

    // Find challenge
    const challenges = await base44.asServiceRole.entities.GameChallenge.filter({
      challenge_token
    });

    if (challenges.length === 0) {
      return Response.json({ error: 'Challenge not found' }, { status: 404 });
    }

    const challenge = challenges[0];

    if (challenge.status !== 'active') {
      return Response.json({ error: 'Challenge is not active' }, { status: 400 });
    }

    if (new Date(challenge.expires_at) < new Date()) {
      return Response.json({ error: 'Challenge has expired' }, { status: 400 });
    }

    // Require authenticated user — anonymous challenge completion is not permitted
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    const userEmail = user.email;

    // Update challenge
    await base44.asServiceRole.entities.GameChallenge.update(challenge.id, {
      status: 'completed',
      completed_by_email: userEmail,
      completed_at: new Date().toISOString(),
      final_score: score
    });

    // Apply discount to ScopeOfWork if linked
    if (challenge.scope_of_work_id) {
      const scope = await base44.asServiceRole.entities.ScopeOfWork.filter({
        id: challenge.scope_of_work_id
      });

      if (scope.length > 0) {
        const scopeRecord = scope[0];
        const originalCost = scopeRecord.original_cost_amount || scopeRecord.cost_amount;
        const discountAmount = (originalCost * challenge.discount_percentage) / 100;
        const newCost = originalCost - discountAmount;

        await base44.asServiceRole.entities.ScopeOfWork.update(challenge.scope_of_work_id, {
          game_discount_percentage: challenge.discount_percentage,
          original_cost_amount: originalCost,
          cost_amount: newCost,
          game_discount_applied: true
        });

        console.info(`[completeChallenge] Applied ${challenge.discount_percentage}% discount to scope ${challenge.scope_of_work_id}`);
      }
    }

    console.info(`[completeChallenge] Challenge ${challenge_token} completed by ${userEmail} with score ${score}`);

    return Response.json({
      success: true,
      challenge_completed: true,
      discount_applied: !!challenge.scope_of_work_id
    });
  } catch (error) {
    console.error('[completeChallenge] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});