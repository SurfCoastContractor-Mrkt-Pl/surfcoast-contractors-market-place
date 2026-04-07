import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import TradeGameViewer from '@/components/tradegames/TradeGameViewer';
import GameChallengeCreator from '@/components/tradegames/GameChallengeCreator';
import GameCompletionModal from '@/components/tradegames/GameCompletionModal';
import MyChallengesDashboard from '@/components/tradegames/MyChallengesDashboard';
import { Play, Zap, Trophy } from 'lucide-react';
import ScenarioIntroModal from '@/components/tradegames/ScenarioIntroModal';

const TRADE_FILTERS = ['all', 'plumbing', 'electrical', 'carpentry', 'hvac'];

export default function TradeGames() {
  const [selectedGame, setSelectedGame] = useState(null);
  const [gameMode, setGameMode] = useState('sandbox');
  const [user, setUser] = useState(null);
  const [showChallengeCreator, setShowChallengeCreator] = useState(false);
  const [showScenario, setShowScenario] = useState(false);
  const [tradeFilter, setTradeFilter] = useState('all');
  const [completionResult, setCompletionResult] = useState(null);

  // Fetch current user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (err) {
        // User not logged in
      }
    };
    fetchUser();
  }, []);

  // Fetch available games
  const { data: games = [], isLoading } = useQuery({
    queryKey: ['trade-games'],
    queryFn: async () => {
      try {
        const allGames = await base44.entities.TradeGame.filter(
          { is_published: true },
          '-created_at',
          50
        );
        return allGames;
      } catch (err) {
        console.error('Error fetching games:', err);
        return [];
      }
    }
  });

  // Handle game completion
  const handleGameComplete = async (results) => {
    if (!user || !selectedGame) return;

    try {
      // Call backend function to complete game session and apply discount
      const response = await base44.functions.invoke('completeGameSession', {
        gameId: selectedGame.id,
        score: results.score,
        moves: results.moves,
        duration: results.duration || 0,
        gameMode: gameMode,
        scopeId: null
      });

      // Update game statistics
      try {
        await base44.functions.invoke('updateGameStats', {
          game_id: selectedGame.id,
          session_id: response.data.sessionId
        });
      } catch (err) {
        console.error('Error updating stats:', err);
      }

      setCompletionResult({ score: results.score, discount: response.data.discount });
      setSelectedGame(null);
    } catch (err) {
      console.error('Error completing game session:', err);
      alert('Error saving your progress. Please try again.');
    }
  };

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  // Challenge creator modal
  if (showChallengeCreator && selectedGame) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div className="max-w-2xl mx-auto">
          <Button
            variant="outline"
            onClick={() => setShowChallengeCreator(false)}
            className="mb-6"
          >
            Back to Games
          </Button>
          <GameChallengeCreator
            gameId={selectedGame.id}
            gameTitle={selectedGame.title}
            onChallengeCreated={() => {
              setShowChallengeCreator(false);
              setSelectedGame(null);
            }}
          />
        </div>
      </div>
    );
  }

  // Scenario intro modal (shown before game starts)
  if (showScenario && selectedGame) {
    return (
      <ScenarioIntroModal
        gameData={selectedGame}
        onStart={() => setShowScenario(false)}
        onClose={() => { setShowScenario(false); setSelectedGame(null); }}
      />
    );
  }

  // Game viewer
  if (selectedGame) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex items-center justify-between gap-4 p-4 bg-white border-b">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedGame(null)}>
              Back to Games
            </Button>
            <h1 className="text-xl font-bold">{selectedGame.title}</h1>
          </div>
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setShowChallengeCreator(true)}
            >
              <Zap className="w-4 h-4" />
              Create Challenge
            </Button>
          )}
        </div>
        <TradeGameViewer
          gameData={selectedGame}
          gameMode={gameMode}
          onGameComplete={handleGameComplete}
        />
      </div>
    );
  }

  // Completion modal
  if (completionResult) {
    return (
      <GameCompletionModal
        score={completionResult.score}
        discount={completionResult.discount}
        onClose={() => setCompletionResult(null)}
        onPlayAgain={() => { setCompletionResult(null); }}
      />
    );
  }

  // Games list with Under Construction overlay
  return (
    <div style={{ position: "relative", minHeight: "100vh", background: T.bg, paddingLeft: 24, paddingRight: 24, paddingTop: 24, paddingBottom: 24, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      {/* Under Construction Overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ textAlign: "center", background: T.card, paddingLeft: 32, paddingRight: 32, paddingTop: 32, paddingBottom: 32, borderRadius: 12, boxShadow: T.shadow, border: "1px solid " + T.border, maxWidth: 448 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, color: T.dark, marginBottom: 12, fontStyle: "italic" }}>Under Construction</h2>
          <p style={{ color: T.dark, fontSize: 16, marginBottom: 8, fontStyle: "italic" }}>Educational Tools and Visual Aids</p>
          <p style={{ color: T.muted, fontSize: 14, fontStyle: "italic" }}>Coming soon with exciting interactive learning experiences</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto opacity-30 pointer-events-none">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Trade Games</h1>
            <p className="text-lg text-slate-600">
              Learn trade skills, solve puzzles, and earn discounts on quotes.
            </p>
          </div>
          {user && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {}}
            >
              <Trophy className="w-4 h-4" />
              My Challenges
            </Button>
          )}
        </div>

        {/* Game Filters */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {TRADE_FILTERS.map(trade => (
            <Button
              key={trade}
              variant={tradeFilter === trade ? 'default' : 'outline'}
              size="sm"
              className="capitalize"
              onClick={() => setTradeFilter(trade)}
            >
              {trade}
            </Button>
          ))}
        </div>

        {/* Games Grid */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          </div>
        ) : games.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 text-lg">No games available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {games.filter(g => tradeFilter === 'all' || g.trade_type === tradeFilter).map(game => (
              <Card key={game.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Game Image */}
                {game.image_url && (
                  <img
                    src={game.image_url}
                    alt={game.title}
                    className="w-full h-40 object-cover"
                  />
                )}

                {/* Game Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">{game.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{game.description}</p>
                  </div>

                  {/* Badges */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="capitalize">
                      {game.trade_type}
                    </Badge>
                    <Badge
                      className="capitalize"
                      variant={
                        game.difficulty === 'hard'
                          ? 'destructive'
                          : game.difficulty === 'medium'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {game.difficulty}
                    </Badge>
                    {game.is_premium && <Badge className="bg-yellow-500 text-white">Premium</Badge>}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-slate-500">Played</p>
                      <p className="font-semibold text-slate-700">{game.play_count || 0}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Avg Score</p>
                      <p className="font-semibold text-slate-700">{Math.round(game.average_score || 0)}</p>
                    </div>
                  </div>

                  {/* Play Button */}
                  <Button
                    className="w-full gap-2"
                    onClick={() => {
                      setSelectedGame(game);
                      setGameMode('guided_puzzle');
                      setShowScenario(true);
                    }}
                  >
                    <Play className="w-4 h-4" />
                    Play Game
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}