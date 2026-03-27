import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, Check } from 'lucide-react';

export default function PDFTemplateSelector({ availableTemplates, selectedTemplate, onSelect, onLockedClick }) {
  const templates = {
    basic: {
      name: 'Basic',
      description: 'Clean and simple invoice layout',
      features: ['Company info', 'Line items', 'Total'],
      tier: 'standard',
    },
    professional: {
      name: 'Professional',
      description: 'Customizable with logo and colors',
      features: ['Custom branding', 'Professional styling', 'Terms & conditions'],
      tier: 'licensed',
    },
    premium: {
      name: 'Premium',
      description: 'Advanced with payment terms and milestones',
      features: ['Payment terms', 'Project timeline', 'Advanced branding'],
      tier: 'premium',
    },
    custom: {
      name: 'Custom',
      description: 'Full customization available',
      features: ['Full design control', 'Custom fields', 'Brand assets'],
      tier: 'premium',
    },
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {Object.entries(templates).map(([key, template]) => {
        const isAvailable = availableTemplates.includes(key);
        const isSelected = selectedTemplate === key;

        return (
          <Card
            key={key}
            className={`p-4 cursor-pointer transition-all ${
              isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:shadow-md'
            } ${!isAvailable ? 'opacity-50' : ''}`}
            onClick={() => isAvailable && onSelect(key)}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-semibold text-slate-900">{template.name}</h4>
                <p className="text-xs text-slate-600 mt-1">{template.description}</p>
              </div>
              {isAvailable ? (
                isSelected && <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
              ) : (
                <Lock className="w-5 h-5 text-slate-400 flex-shrink-0" />
              )}
            </div>

            <div className="mb-3 space-y-1">
              {template.features.map((feature, idx) => (
                <p key={idx} className="text-xs text-slate-600">• {feature}</p>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <Badge variant={isAvailable ? 'secondary' : 'outline'}>
                {template.tier.charAt(0).toUpperCase() + template.tier.slice(1)}
              </Badge>
              {!isAvailable && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onLockedClick(template.tier);
                  }}
                  className="text-xs text-blue-600 h-auto p-0"
                >
                  Unlock
                </Button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}