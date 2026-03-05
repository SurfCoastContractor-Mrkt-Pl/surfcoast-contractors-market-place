import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Plus, Trash2, DollarSign } from 'lucide-react';

export default function ProgressPaymentPhases({ phases = [], onChange, readOnly = false }) {
  const [phases_local, setPhases] = useState(phases);

  const addPhase = () => {
    const newPhase = {
      phase_number: phases_local.length + 1,
      phase_title: '',
      description: '',
      amount: ''
    };
    const updated = [...phases_local, newPhase];
    setPhases(updated);
    onChange(updated);
  };

  const updatePhase = (index, field, value) => {
    const updated = [...phases_local];
    updated[index] = { ...updated[index], [field]: value };
    setPhases(updated);
    onChange(updated);
  };

  const removePhase = (index) => {
    const updated = phases_local.filter((_, i) => i !== index);
    setPhases(updated);
    onChange(updated);
  };

  const totalAmount = phases_local.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Progress Payment Phases</h3>
        {!readOnly && (
          <Button size="sm" onClick={addPhase} className="bg-amber-500 hover:bg-amber-600">
            <Plus className="w-4 h-4 mr-1" /> Add Phase
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {phases_local.map((phase, idx) => (
          <Card key={idx} className="p-4 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor={`phase-title-${idx}`} className="text-xs font-semibold">Phase {phase.phase_number} Title *</Label>
                    <Input
                      id={`phase-title-${idx}`}
                      value={phase.phase_title}
                      onChange={(e) => updatePhase(idx, 'phase_title', e.target.value)}
                      placeholder="e.g., Demolition & Prep"
                      className="mt-1"
                      disabled={readOnly}
                    />
                  </div>
                  <div>
                    <Label htmlFor={`phase-amount-${idx}`} className="text-xs font-semibold flex items-center gap-1">
                      <DollarSign className="w-3 h-3" /> Amount *
                    </Label>
                    <Input
                      id={`phase-amount-${idx}`}
                      type="number"
                      value={phase.amount}
                      onChange={(e) => updatePhase(idx, 'amount', e.target.value)}
                      placeholder="0.00"
                      className="mt-1"
                      disabled={readOnly}
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor={`phase-desc-${idx}`} className="text-xs font-semibold">Description *</Label>
                  <Textarea
                    id={`phase-desc-${idx}`}
                    value={phase.description}
                    onChange={(e) => updatePhase(idx, 'description', e.target.value)}
                    placeholder="Describe the work to be completed in this phase"
                    rows={3}
                    className="mt-1"
                    disabled={readOnly}
                  />
                </div>
              </div>

              {!readOnly && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removePhase(idx)}
                  className="text-red-600 hover:text-red-700 shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {phases_local.length > 0 && (
        <Card className="p-4 bg-amber-50 border-amber-200">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-900">Total Project Value</span>
            <span className="text-2xl font-bold text-amber-600">${totalAmount.toFixed(2)}</span>
          </div>
        </Card>
      )}
    </div>
  );
}