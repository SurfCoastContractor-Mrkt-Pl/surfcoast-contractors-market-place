import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus } from 'lucide-react';

export default function PartLibrary({ parts, selectedPart, onSelectPart, onPlacePart }) {
  return (
    <Card className="p-4 flex-1 overflow-y-auto">
      <h3 className="font-semibold text-lg mb-3">Available Parts</h3>
      <div className="space-y-2">
        {parts.map(part => (
          <div
            key={part.id}
            className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
              selectedPart?.id === part.id
                ? 'border-primary bg-primary/10'
                : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
            }`}
            onClick={() => onSelectPart(part)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">{part.name}</p>
                <p className="text-xs text-gray-600">{part.type}</p>
              </div>
              <div className="flex gap-1">
                {part.quantity && (
                  <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                    x{part.quantity}
                  </span>
                )}
              </div>
            </div>
            {selectedPart?.id === part.id && (
              <Button
                size="sm"
                className="w-full mt-2 gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onPlacePart(part);
                }}
              >
                <Plus className="w-4 h-4" />
                Place Part
              </Button>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}