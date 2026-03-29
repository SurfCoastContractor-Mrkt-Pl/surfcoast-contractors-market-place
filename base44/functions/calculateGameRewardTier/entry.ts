import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractorEmail } = await req.json();
    const email = contractorEmail || user.email;

    // Only allow users to calculate their own tier, or admins for any
    if (email !== user.email && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all completed sessions for this contractor
    const sessions = await base44.entities.UserGameSession.filter({
      user_email: email,
      is_solved: true
    });

    // Calculate points and stats
    let totalPoints = 0;
    let totalDiscounts = 0;
    let highScore = 0;
    const completedGames = new Map();

    sessions.forEach(session => {
      const points = Math.floor(session.score * 1.5) + (session.discount_earned ? 10 : 0);
      totalPoints += points;
      totalDiscounts += session.discount_percentage || 0;
      highScore = Math.max(highScore, session.score);

      // Track game completion counts
      const gameId = session.trade_game_id;
      completedGames.set(gameId, (completedGames.get(gameId) || 0) + 1);
    });

    // Determine tier based on points
    let tier = 'bronze';
    let nextTierPoints = 500;

    if (totalPoints >= 2000) {
      tier = 'platinum';
      nextTierPoints = null;
    } else if (totalPoints >= 1200) {
      tier = 'gold';
      nextTierPoints = 2000;
    } else if (totalPoints >= 600) {
      tier = 'silver';
      nextTierPoints = 1200;
    }

    // Calculate achievements
    const achievements = [];
    if (highScore === 100) achievements.push('perfect_score');
    if (sessions.some(s => s.duration_seconds < 120)) achievements.push('speed_demon');
    if (sessions.filter(s => s.score >= 80).length >= 3) achievements.push('streak_3');
    if (sessions.filter(s => s.score >= 80).length >= 10) achievements.push('streak_10');

    // Tier benefits
    const tierBenefits = {
      bronze: ['5% base game discount', 'Basic leaderboard access'],
      silver: ['10% base game discount', 'Premium leaderboard access', 'Monthly achievement summary'],
      gold: ['15% base game discount', 'VIP leaderboard section', 'Exclusive game access', 'Monthly reward bonus'],
      platinum: ['20% base game discount', 'Hall of Fame status', 'All exclusive games', 'Quarterly reward bonus', 'Personal game recommendations']
    };

    // Upsert reward tier record
    let rewardTier = await base44.entities.GameRewardTier.filter({
      contractor_email: email
    }).then(results => results[0] || null);

    const tierData = {
      contractor_email: email,
      current_tier: tier,
      tier_points: totalPoints,
      total_games_completed: sessions.length,
      total_discounts_earned: totalDiscounts,
      lifetime_high_score: highScore,
      achievement_badges: achievements.map(name => ({
        badge_name: name,
        earned_at: new Date().toISOString()
      })),
      next_tier_points_needed: nextTierPoints,
      tier_benefits_unlocked: tierBenefits[tier],
      last_updated: new Date().toISOString()
    };

    if (rewardTier) {
      await base44.entities.GameRewardTier.update(rewardTier.id, tierData);
    } else {
      rewardTier = await base44.entities.GameRewardTier.create(tierData);
    }

    console.info(`[calculateGameRewardTier] Updated tier for ${email}: ${tier} (${totalPoints} points)`);

    return Response.json({
      success: true,
      rewardTier: tierData
    });
  } catch (error) {
    console.error('[calculateGameRewardTier] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});