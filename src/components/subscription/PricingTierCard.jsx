import React from 'react';
import { Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PricingTierCard({ tier, price, features, isSelected = false, onSelect = null }) {
  return (
    <div
      className={`rounded-lg border-2 p-8 flex flex-col transition-all ${
        isSelected
          ? 'border-primary bg-primary/5 shadow-lg'
          : 'border-border bg-card hover:border-primary/50'
      }`}
    >
      <h3 className="text-2xl font-bold text-foreground mb-2 capitalize">{tier}</h3>
      
      <div className="mb-6">
        <span className="text-4xl font-bold text-foreground">${(price / 100).toFixed(2)}</span>
        <span className="text-muted-foreground ml-2">/month</span>
      </div>

      <div className="flex-1 mb-8 space-y-3">
        {features.map((feature, idx) => (
          <div key={idx} className="flex items-start gap-3">
            <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <span className="text-sm text-foreground">{feature}</span>
          </div>
        ))}
      </div>

      {onSelect && (
        <Button
          onClick={() => onSelect(tier, price)}
          variant={isSelected ? 'default' : 'outline'}
          className="w-full"
        >
          {isSelected ? 'Current Plan' : 'Select Plan'}
        </Button>
      )}
    </div>
  );
}