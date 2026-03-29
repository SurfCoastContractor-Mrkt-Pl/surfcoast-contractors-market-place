import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import { crypto } from 'https://deno.land/std@0.208.0/crypto/mod.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trade_game_id, game_title, scope_of_work_id, discount_percentage } = await req.json();

    if (!trade_game_id || !game_title || !discount_percentage) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique token
    const randomBytes = crypto.getRandomValues(new Uint8Array(16));
    const challenge_token = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
      .substring(0, 24);

    // Create challenge
    const challenge = await base44.entities.GameChallenge.create({
      contractor_email: user.email,
      contractor_name: user.full_name,
      trade_game_id,
      game_title,
      challenge_token,
      scope_of_work_id: scope_of_work_id || null,
      discount_percentage,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    });

    console.info(`[createGameChallenge] ${user.email} created challenge ${challenge_token}`);

    return Response.json({
      success: true,
      challenge_id: challenge.id,
      challenge_token,
      challenge_link: `${Deno.env.get('APP_URL')}/challenge/${challenge_token}`
    });
  } catch (error) {
    console.error('[createGameChallenge] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});