import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { gameId, gameTitle, scopeId, discountPercentage } = await req.json();

    if (!gameId || !gameTitle || !discountPercentage) {
      return Response.json(
        { error: 'Missing required fields: gameId, gameTitle, discountPercentage' },
        { status: 400 }
      );
    }

    // Generate unique challenge token
    const tokenBytes = crypto.getRandomValues(new Uint8Array(16));
    const challengeToken = Array.from(tokenBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 12);

    // Create challenge record
    const challenge = await base44.entities.GameChallenge.create({
      contractor_email: user.email,
      contractor_name: user.full_name || user.email,
      trade_game_id: gameId,
      game_title: gameTitle,
      challenge_token: challengeToken,
      scope_of_work_id: scopeId || null,
      discount_percentage: discountPercentage,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active'
    });

    const challengeLink = `${Deno.env.get('APP_URL') || 'https://app.surfcoast.com'}/challenge/${challengeToken}`;

    console.log(`Challenge created: ${challenge.id}, token: ${challengeToken}`);

    return Response.json({
      success: true,
      challengeId: challenge.id,
      challengeToken: challengeToken,
      challengeLink: challengeLink,
      expiresAt: challenge.expires_at
    });
  } catch (error) {
    console.error('Error creating challenge:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});