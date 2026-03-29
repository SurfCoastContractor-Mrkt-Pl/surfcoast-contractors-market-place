import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's sessions
    const sessions = await base44.entities.UserGameSession.filter({
      user_email: user.email
    });

    if (sessions.length === 0) {
      return Response.json({ achievements: [], newAchievements: [] });
    }

    // Get existing achievements
    const existingAchievements = await base44.entities.GameAchievement.filter({
      user_email: user.email
    });

    const earnedTypes = new Set(existingAchievements.map(a => a.achievement_type));
    const newAchievements = [];

    // Check perfect_score
    if (!earnedTypes.has('perfect_score')) {
      const perfectSession = sessions.find(s => s.is_solved && s.score >= 100);
      if (perfectSession) {
        newAchievements.push({
          user_email: user.email,
          achievement_type: 'perfect_score',
          achievement_name: '🎯 Perfect Score',
          description: 'Achieved a perfect score',
          icon_emoji: '🎯',
          rarity: 'rare',
          points_awarded: 50,
          game_id: perfectSession.trade_game_id,
          game_title: perfectSession.trade_game_id,
          earned_at: new Date().toISOString(),
          progress_value: perfectSession.score
        });
      }
    }

    // Check speed_demon
    if (!earnedTypes.has('speed_demon')) {
      const speedSession = sessions.find(s => s.is_solved && s.duration_seconds < 120);
      if (speedSession) {
        newAchievements.push({
          user_email: user.email,
          achievement_type: 'speed_demon',
          achievement_name: '⚡ Speed Demon',
          description: 'Completed a game in under 2 minutes',
          icon_emoji: '⚡',
          rarity: 'rare',
          points_awarded: 40,
          game_id: speedSession.trade_game_id,
          game_title: speedSession.trade_game_id,
          earned_at: new Date().toISOString(),
          progress_value: speedSession.duration_seconds
        });
      }
    }

    // Check mastercraft
    if (!earnedTypes.has('mastercraft')) {
      const completedCount = sessions.filter(s => s.is_solved).length;
      if (completedCount >= 20) {
        newAchievements.push({
          user_email: user.email,
          achievement_type: 'mastercraft',
          achievement_name: '🏆 Mastercraft',
          description: 'Completed 20 games',
          icon_emoji: '🏆',
          rarity: 'epic',
          points_awarded: 100,
          earned_at: new Date().toISOString(),
          progress_value: completedCount
        });
      }
    }

    // Check versatile_player
    if (!earnedTypes.has('versatile_player')) {
      const uniqueGames = new Set(sessions.filter(s => s.is_solved).map(s => s.trade_game_id)).size;
      if (uniqueGames >= 5) {
        newAchievements.push({
          user_email: user.email,
          achievement_type: 'versatile_player',
          achievement_name: '🎮 Versatile Player',
          description: 'Played and completed 5 different games',
          icon_emoji: '🎮',
          rarity: 'rare',
          points_awarded: 60,
          earned_at: new Date().toISOString(),
          progress_value: uniqueGames
        });
      }
    }

    // Create new achievements
    for (const achievement of newAchievements) {
      await base44.entities.GameAchievement.create(achievement);
    }

    console.info(`[calculateGameAchievements] ${user.email}: ${newAchievements.length} new achievements earned`);

    return Response.json({
      success: true,
      userEmail: user.email,
      newAchievements,
      totalAchievements: existingAchievements.length + newAchievements.length
    });
  } catch (error) {
    console.error('[calculateGameAchievements] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});