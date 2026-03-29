import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertCircle, Copy, Check, Loader2 } from 'lucide-react';

export default function GameChallengeCreator({ game, onClose }) {
  const [discountPercentage, setDiscountPercentage] = useState('10');
  const [scopeId, setScopeId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [challengeLink, setChallengeLink] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCreateChallenge = async () => {
    if (!discountPercentage || discountPercentage < 1 || discountPercentage > 50) {
      alert('Discount must be between 1% and 50%');
      return;
    }

    setIsLoading(true);
    try {
      const response = await base44.functions.invoke('createGameChallenge', {
        gameId: game.id,
        gameTitle: game.title,
        scopeId: scopeId || null,
        discountPercentage: parseInt(discountPercentage)
      });

      setChallengeLink(response.data.challengeLink);
    } catch (err) {
      console.error('Error creating challenge:', err);
      alert('Failed to create challenge. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(challengeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (challengeLink) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Challenge Created!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded p-3">
            <p className="text-sm text-green-800 font-medium">
              Share this link with your client to challenge them to complete {game.title}
            </p>
          </div>

          <div className="bg-gray-50 rounded p-3 border font-mono text-sm break-all">
            {challengeLink}
          </div>

          <div className="flex gap-2">
            <Button
              className="flex-1 gap-2"
              onClick={handleCopyLink}
              variant="outline"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 text-sm">
            <div>
              <p className="text-gray-600">Discount Offered</p>
              <p className="font-semibold">{discountPercentage}%</p>
            </div>
            <div>
              <p className="text-gray-600">Expires In</p>
              <p className="font-semibold">30 days</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Challenge: {game.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex gap-2">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-blue-800">
            Create a challenge link to encourage clients to complete this game and earn a discount
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Discount Percentage</label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min="1"
              max="50"
              value={discountPercentage}
              onChange={(e) => setDiscountPercentage(e.target.value)}
              className="flex-1"
            />
            <span className="text-sm font-medium">%</span>
          </div>
          <p className="text-xs text-gray-500">Offer between 1% and 50% discount</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium">Link to Scope (Optional)</label>
          <Input
            placeholder="Leave blank to not link to a specific job"
            value={scopeId}
            onChange={(e) => setScopeId(e.target.value)}
          />
          <p className="text-xs text-gray-500">Discount will auto-apply to this scope upon completion</p>
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            className="flex-1 gap-2"
            onClick={handleCreateChallenge}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Challenge'
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}