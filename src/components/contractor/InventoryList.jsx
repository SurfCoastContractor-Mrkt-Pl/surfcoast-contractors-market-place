import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, Edit, Trash2, Plus } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function InventoryList({ items, onEdit, onDelete, onRefresh }) {
  const [deleting, setDeleting] = useState(null);

  const handleDelete = async (id) => {
    if (!confirm('Delete this inventory item?')) return;
    setDeleting(id);
    try {
      await base44.entities.ContractorInventory.delete(id);
      onDelete();
    } catch (error) {
      alert('Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  const isLowStock = (item) => item.current_quantity <= item.low_stock_threshold;

  const categoryColors = {
    electrical: 'bg-yellow-100 text-yellow-800',
    plumbing: 'bg-blue-100 text-blue-800',
    hvac: 'bg-purple-100 text-purple-800',
    carpentry: 'bg-orange-100 text-orange-800',
    tools: 'bg-red-100 text-red-800',
    safety: 'bg-green-100 text-green-800',
    fasteners: 'bg-slate-100 text-slate-800',
    other: 'bg-gray-100 text-gray-800',
  };

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Plus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
        <p className="text-slate-500">No inventory items yet. Add one to get started.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => {
        const low = isLowStock(item);
        return (
          <Card
            key={item.id}
            className={`p-4 border-l-4 ${low ? 'border-l-red-500 bg-red-50' : 'border-l-green-500'}`}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
              <div>
                <div className="flex items-start gap-2">
                  {low && <AlertCircle className="w-4 h-4 text-red-500 mt-1 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{item.material_name}</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge className={categoryColors[item.category]}>
                        {item.category}
                      </Badge>
                      {low && <Badge className="bg-red-500 text-white">Low Stock</Badge>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-sm">
                <p className="text-slate-600">Quantity</p>
                <p className={`text-lg font-bold ${low ? 'text-red-600' : 'text-green-600'}`}>
                  {item.current_quantity} {item.unit}
                </p>
                <p className="text-slate-500 text-xs">Threshold: {item.low_stock_threshold}</p>
                {item.unit_cost && (
                  <p className="text-slate-600 text-xs mt-1">
                    Value: ${(item.current_quantity * item.unit_cost).toFixed(2)}
                  </p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                <div className="text-sm text-slate-600">
                  {item.supplier && <p>Supplier: {item.supplier}</p>}
                  {item.last_restocked_date && (
                    <p className="text-xs mt-1">
                      Restocked: {new Date(item.last_restocked_date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onEdit(item)}
                    className="text-blue-600"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(item.id)}
                    disabled={deleting === item.id}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}