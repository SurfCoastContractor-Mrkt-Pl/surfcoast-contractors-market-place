import React from 'react';
import { Check } from 'lucide-react';

export default function FeatureCard({ icon: Icon, title, description, availableInTrial = true }) {
  return (
    <div className="bg-card border-2 border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-3">{description}</p>
          {availableInTrial && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-secondary/20 text-secondary">
              <Check className="w-3.5 h-3.5" />
              Available in Trial
            </div>
          )}
        </div>
      </div>
    </div>
  );
}