import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Gift, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ReviewIncentivePrompt({ jobTitle, scopeId, onClose }) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Card className="p-6 bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-200 flex items-center justify-center">
            <Gift className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900">Share Your Experience</h3>
            <p className="text-sm text-slate-600 mt-1">
              Your review helps other customers find great professionals
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            setDismissed(true);
            onClose?.();
          }}
          className="p-1 hover:bg-white/50 rounded"
        >
          <X className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      <div className="bg-white rounded-lg p-4 mb-4">
        <p className="text-sm text-slate-700 mb-2">
          <strong>How did "{jobTitle}" go?</strong>
        </p>
        <div className="flex gap-1 mb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
          ))}
        </div>
        <Badge className="bg-green-100 text-green-800 mb-4">Verified Review</Badge>
        <p className="text-xs text-slate-600">
          Verified reviews appear on contractor profiles and help build trust in our community.
        </p>
      </div>

      <Link to={`${createPageUrl('ContractorAccount')}?scrollTo=reviews`}>
        <Button className="w-full bg-amber-500 hover:bg-amber-600">
          Leave a Review
        </Button>
      </Link>
    </Card>
  );
}