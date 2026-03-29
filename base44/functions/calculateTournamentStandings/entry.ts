import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { tournamentId } = await req.json();

    if (!tournamentId) {
      return Response.json({ error: 'tournamentId is required' }, { status: 400 });
    }

    // Get tournament
    const tournament = await base44.entities.SeasonalTournament.get(tournamentId);
    if (!tournament) {
      return Response.json({ error: 'Tournament not found' }, { status: 404 });
    }

    // Get all game sessions for eligible games in this tournament
    const allSessions = await base44.asServiceRole.entities.UserGameSession.filter({});
    
    const tournamentSessions = allSessions.filter(s => 
      tournament.trade_game_ids.includes(s.trade_game_id) &&
      new Date(s.start_time) >= new Date(tournament.start_date) &&
      new Date(s.start_time) <= new Date(tournament.end_date)
    );

    // Calculate standings
    const playerStats = {};
    tournamentSessions.forEach(session => {
      if (!playerStats[session.user_email]) {
        playerStats[session.user_email] = {
          email: session.user_email,
          name: session.user_email,
          gamesCompleted: 0,
          totalScore: 0,
          bestScore: 0,
          wins: 0
        };
      }
      
      if (session.is_solved) {
        playerStats[session.user_email].gamesCompleted++;
        playerStats[session.user_email].totalScore += session.score || 0;
        playerStats[session.user_email].bestScore = Math.max(
          playerStats[session.user_email].bestScore,
          session.score || 0
        );
      }
    });

    // Get competitive match wins
    const matches = await base44.asServiceRole.entities.GameCompetitiveMatch.filter({
      status: 'completed'
    });

    matches.forEach(match => {
      if (match.winner_email && playerStats[match.winner_email]) {
        playerStats[match.winner_email].wins++;
      }
    });

    // Filter qualified players and calculate leaderboard
    const qualified = Object.values(playerStats)
      .filter(p => p.gamesCompleted >= tournament.min_games_required)
      .sort((a, b) => b.totalScore - a.totalScore)
      .map((player, idx) => {
        const rank = idx + 1;
        const prize = tournament.prize_distribution?.[rank] || 0;
        
        return {
          rank,
          player_email: player.email,
          player_name: player.name,
          games_completed: player.gamesCompleted,
          total_score: player.totalScore,
          average_score: Math.round(player.totalScore / player.gamesCompleted),
          best_score: player.bestScore,
          wins: player.wins,
          qualification_status: 'qualified',
          prize_earned: prize
        };
      });

    // Upsert leaderboard entries
    for (const entry of qualified) {
      const existing = await base44.asServiceRole.entities.TournamentLeaderboard.filter({
        tournament_id: tournamentId,
        player_email: entry.player_email
      }).then(results => results[0] || null);

      const data = {
        tournament_id: tournamentId,
        season_number: tournament.season_number,
        ...entry,
        last_updated: new Date().toISOString()
      };

      if (existing) {
        await base44.asServiceRole.entities.TournamentLeaderboard.update(existing.id, data);
      } else {
        await base44.asServiceRole.entities.TournamentLeaderboard.create(data);
      }
    }

    console.info(`[calculateTournamentStandings] Tournament ${tournamentId}: ${qualified.length} qualified players`);

    return Response.json({
      success: true,
      tournamentId,
      qualifiedCount: qualified.length,
      topRanks: qualified.slice(0, 10)
    });
  } catch (error) {
    console.error('[calculateTournamentStandings] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});