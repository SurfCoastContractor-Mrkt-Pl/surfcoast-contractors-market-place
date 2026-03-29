import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Check } from 'lucide-react';

export default function GameChallengeCreator({ gameId, gameTitle, onChallengeCreated }) {
  const [discountPercentage, setDiscountPercentage] = useState(10);
  const [scopeId, setScopeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdChallenge, setCreatedChallenge] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateChallenge = async () => {
    setLoading(true);
    try {
      const response = await base44.functions.invoke('createGameChallenge', {
        trade_game_id: gameId,
        game_title: gameTitle,
        scope_of_work_id: scopeId || null,
        discount_percentage: discountPercentage
      });

      setCreatedChallenge(response.data);
      onChallengeCreated?.(response.data);
    } catch (error) {
      console.error('Failed to create challenge:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(createdChallenge.challenge_link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdChallenge) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700">Challenge Created!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white p-4 rounded border border-green-200">
            <p className="text-sm text-gray-600 mb-2">Challenge Link:</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={createdChallenge.challenge_link}
                readOnly
                className="flex-1 px-3 py-2 border rounded bg-gray-50 text-sm"
              />
              <Button
                size="sm"
                onClick={handleCopyLink}
                variant="outline"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600">
            Share this link with your client. They'll earn a {discountPercentage}% discount when they complete the game!
          </p>
          <Button
            onClick={() => {
              setCreatedChallenge(null);
              setDiscountPercentage(10);
              setScopeId('');
            }}
            variant="outline"
            className="w-full"
          >
            Create Another Challenge
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Create Challenge</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Game</label>
          <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{gameTitle}</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Discount Percentage</label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              max="100"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(Number(e.target.value))}
              className="flex-1"
            />
            <span className="flex items-center px-3 bg-gray-50 rounded text-sm font-medium">%</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Link to ScopeOfWork (Optional)</label>
          <Input
            type="text"
            placeholder="ScopeOfWork ID"
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to create a standalone challenge</p>
        </div>

        <Button
          onClick={handleCreateChallenge}
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Creating...' : 'Create Challenge Link'}
        </Button>
      </CardContent>
    </Card>
  );
}