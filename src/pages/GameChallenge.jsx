import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Clock } from 'lucide-react';
import TradeGameViewer from '@/components/tradegames/TradeGameViewer';

export default function GameChallenge() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(null);
  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameActive, setGameActive] = useState(false);

  useEffect(() => {
    const loadChallenge = async () => {
      try {
        // Fetch current user
        const currentUser = await base44.auth.me().catch(() => null);
        setUser(currentUser);

        // Find challenge by token
        const challenges = await base44.entities.GameChallenge.filter(
          { challenge_token: token, status: 'active' },
          '-created_at',
          1
        );

        if (!challenges || challenges.length === 0) {
          setError('Challenge not found or has expired');
          return;
        }

        const foundChallenge = challenges[0];
        setChallenge(foundChallenge);

        // Fetch the game
        const gameData = await base44.entities.TradeGame.get(foundChallenge.trade_game_id);
        setGame(gameData);
      } catch (err) {
        console.error('Error loading challenge:', err);
        setError('Failed to load challenge. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadChallenge();
  }, [token]);

  const handleGameComplete = async (results) => {
    if (!user || !challenge || !game) return;

    try {
      // Complete the game session
      const response = await base44.functions.invoke('completeGameSession', {
        gameId: game.id,
        score: results.score,
        moves: results.moves,
        duration: results.duration || 0,
        gameMode: 'guided_puzzle',
        scopeId: challenge.scope_of_work_id
      });

      // Complete challenge and apply discount
      await base44.functions.invoke('completeChallenge', {
        challenge_token: challenge.challenge_token,
        score: results.score
      });

      // Update game statistics
      try {
        await base44.functions.invoke('updateGameStats', {
          game_id: game.id,
          session_id: response.data.sessionId
        });
      } catch (err) {
        console.error('Error updating stats:', err);
      }

      setGameActive(false);
      alert(`Challenge completed! You earned a ${response.data.discount}% discount!`);
    } catch (err) {
      console.error('Error completing challenge:', err);
      alert('Error completing challenge. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
          <p className="text-slate-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="flex gap-3 items-start">
              <AlertCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-slate-900">Challenge Error</h3>
                <p className="text-sm text-slate-600 mt-1">{error}</p>
              </div>
            </div>
            <Button className="w-full mt-6" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!challenge || !game) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <p className="text-slate-600">Challenge not found.</p>
            <Button className="w-full mt-6" onClick={() => navigate('/')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameActive) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="flex items-center gap-4 p-4 bg-white border-b">
          <Button variant="outline" onClick={() => setGameActive(false)}>
            Exit Challenge
          </Button>
          <h1 className="text-xl font-bold">{game.title}</h1>
          <Badge className="ml-auto">{challenge.discount_percentage}% discount</Badge>
        </div>
        <TradeGameViewer
          gameData={game}
          gameMode="guided_puzzle"
          onGameComplete={handleGameComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>

        <Card className="overflow-hidden">
          {game.image_url && (
            <img
              src={game.image_url}
              alt={game.title}
              className="w-full h-48 object-cover"
            />
          )}

          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-3xl mb-2">{game.title}</CardTitle>
                <p className="text-slate-600">{game.description}</p>
              </div>
              <Badge variant="default" className="text-lg px-3 py-1">
                {challenge.discount_percentage}% Off
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Challenge Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 rounded p-4">
                <p className="text-xs text-blue-600 font-medium mb-1">From</p>
                <p className="font-semibold text-slate-900">{challenge.contractor_name}</p>
              </div>
              <div className="bg-purple-50 rounded p-4">
                <p className="text-xs text-purple-600 font-medium mb-1">Difficulty</p>
                <Badge variant="outline" className="capitalize w-fit">
                  {game.difficulty}
                </Badge>
              </div>
              <div className="bg-amber-50 rounded p-4">
                <p className="text-xs text-amber-600 font-medium mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires In
                </p>
                <p className="font-semibold text-slate-900">30 days</p>
              </div>
            </div>

            {/* Game Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-100 rounded p-3">
                <p className="text-xs text-slate-600 font-medium">Times Played</p>
                <p className="text-xl font-bold text-slate-900">{game.play_count || 0}</p>
              </div>
              <div className="bg-slate-100 rounded p-3">
                <p className="text-xs text-slate-600 font-medium">Avg Score</p>
                <p className="text-xl font-bold text-slate-900">{Math.round(game.average_score || 0)}</p>
              </div>
            </div>

            {/* Login Prompt */}
            {!user && (
              <div className="bg-blue-50 border border-blue-200 rounded p-4 flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">Login Required</p>
                  <p className="text-sm text-blue-800 mt-1">
                    Please log in or create an account to complete this challenge and claim your discount.
                  </p>
                </div>
              </div>
            )}

            {/* CTA */}
            <Button
              className="w-full py-6 text-lg gap-2"
              size="lg"
              onClick={() => {
                if (!user) {
                  base44.auth.redirectToLogin();
                } else {
                  setGameActive(true);
                }
              }}
            >
              {user ? (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Accept Challenge
                </>
              ) : (
                'Login to Accept Challenge'
              )}
            </Button>

            {/* Educational Content */}
            {game.educational_content_md && (
              <div className="bg-slate-50 rounded p-4 text-sm text-slate-700 prose prose-sm max-w-none">
                <h4 className="font-semibold mb-2">What You'll Learn</h4>
                {game.educational_content_md.split('\n').slice(0, 3).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}