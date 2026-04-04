import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TierLimitGate({ title, message, onUpgrade }) {
  return (
    <div className="rounded-lg border-2 border-destructive bg-destructive/10 p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8 text-destructive" />
      </div>
      <h3 className="text-lg font-bold text-destructive mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{message}</p>
      {onUpgrade && (
        <Button onClick={onUpgrade} className="bg-destructive hover:opacity-90">
          Upgrade Plan
        </Button>
      )}
    </div>
  );
}