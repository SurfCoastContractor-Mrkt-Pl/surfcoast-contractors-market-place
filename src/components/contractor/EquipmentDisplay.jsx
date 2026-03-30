import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Wrench, Pencil } from 'lucide-react';
import EquipmentManager from './EquipmentManager';

const CATEGORY_LABELS = {
  power_tools: 'Power Tools',
  hand_tools: 'Hand Tools',
  safety_equipment: 'Safety Equipment',
  heavy_machinery: 'Heavy Machinery',
  specialty_tools: 'Specialty Tools',
  other: 'Other',
};

const CATEGORY_COLORS = {
  power_tools: 'bg-blue-100 text-blue-700 border-blue-200',
  hand_tools: 'bg-green-100 text-green-700 border-green-200',
  safety_equipment: 'bg-orange-100 text-orange-700 border-orange-200',
  heavy_machinery: 'bg-red-100 text-red-700 border-red-200',
  specialty_tools: 'bg-purple-100 text-purple-700 border-purple-200',
  other: 'bg-slate-100 text-slate-600 border-slate-200',
};

export default function EquipmentDisplay({ contractorId, isOwner = false }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const { data: equipment, isLoading } = useQuery({
    queryKey: ['equipment', contractorId],
    queryFn: () => base44.entities.Equipment.filter({ contractor_id: contractorId }),
  });

  const deleteMutation = useMutation({
    mutationFn: (equipmentId) => base44.entities.Equipment.delete(equipmentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment', contractorId] });
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wrench className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Equipment & Tools</h3>
        </div>
        <div className="grid gap-3">
          {[1, 2].map(i => (
            <div key={i} className="h-32 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-slate-500" />
          <h3 className="font-semibold text-slate-900">Equipment & Tools</h3>
        </div>
        {isOwner && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => { setEditingEquipment(null); setDialogOpen(true); }}
            className="gap-1.5 text-amber-600 border-amber-200 hover:bg-amber-50"
          >
            <Plus className="w-4 h-4" />
            Add Equipment
          </Button>
        )}
      </div>

      {equipment && equipment.length > 0 ? (
        <div className="grid gap-4">
          {equipment.map(item => (
            <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex gap-4 p-4">
                {item.photo_url && (
                  <img
                    src={item.photo_url}
                    alt={item.name}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-slate-900">{item.name}</h4>
                    {isOwner && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          onClick={() => { setEditingEquipment(item); setDialogOpen(true); }}
                          className="p-1.5 hover:bg-blue-100 rounded text-blue-600"
                          title="Edit equipment"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteMutation.mutate(item.id)}
                          className="p-1.5 hover:bg-red-100 rounded text-red-600"
                          disabled={deleteMutation.isPending}
                          title="Delete equipment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className={CATEGORY_COLORS[item.category] || CATEGORY_COLORS.other}>
                      {CATEGORY_LABELS[item.category] || item.category}
                    </Badge>
                    {!item.available && (
                      <Badge variant="outline" className="text-slate-600">Not Available</Badge>
                    )}
                  </div>
                  {item.description && (
                    <p className="text-sm text-slate-600">{item.description}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-500">
          <Wrench className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">
            {isOwner ? 'Add equipment to showcase what tools you have available' : 'No equipment listed yet'}
          </p>
        </div>
      )}

      <EquipmentManager
        contractorId={contractorId}
        open={dialogOpen}
        equipment={editingEquipment}
        onClose={() => { setDialogOpen(false); setEditingEquipment(null); }}
      />
    </Card>
  );
}