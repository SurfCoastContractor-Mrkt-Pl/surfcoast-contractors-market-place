import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Package, TrendingDown, DollarSign, Plus, ArrowLeft } from 'lucide-react';
import InventoryForm from '@/components/contractor/InventoryForm';
import InventoryList from '@/components/contractor/InventoryList';
import LowStockNotifications from '@/components/contractor/LowStockNotifications';

export default function ContractorInventoryDashboard() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    loadUser();
  }, []);

  // Fetch contractor
  const { data: contractor } = useQuery({
    queryKey: ['contractor', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      const contractors = await base44.entities.Contractor.filter({ email: user.email });
      return contractors?.[0];
    },
    enabled: !!user?.email,
  });

  // Fetch inventory
  const { data: inventory = [], refetch: refetchInventory } = useQuery({
    queryKey: ['inventory', contractor?.id],
    queryFn: async () => {
      if (!contractor?.id) return [];
      return await base44.entities.ContractorInventory.filter(
        { contractor_id: contractor.id },
        '-created_date'
      );
    },
    enabled: !!contractor?.id,
  });

  if (!user || !contractor) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  const lowStockItems = inventory.filter((item) => item.current_quantity <= item.low_stock_threshold);
  const totalValue = inventory.reduce((sum, item) => sum + (item.current_quantity * (item.unit_cost || 0)), 0);
  const totalItems = inventory.reduce((sum, item) => sum + item.current_quantity, 0);

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleSave = () => {
    refetchInventory();
    setShowForm(false);
    setEditingItem(null);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-slate-50 to-white">
      <LowStockNotifications contractorEmail={user?.email} />
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <a href="/FieldOps" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-4">
            <ArrowLeft className="w-4 h-4" />
            Back to Field Ops
          </a>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Inventory Management</h1>
          <p className="text-slate-600">Track materials, monitor stock levels, and manage inventory</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-slate-600">Total Items</p>
                <p className="text-2xl font-bold text-blue-900">{inventory.length}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-slate-600">Total Units</p>
                <p className="text-2xl font-bold text-green-900">{totalItems.toFixed(1)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-slate-600">Inventory Value</p>
                <p className="text-2xl font-bold text-purple-900">${totalValue.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
            <div className="flex items-center gap-3">
              <TrendingDown className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-slate-600">Low Stock</p>
                <p className="text-2xl font-bold text-red-900">{lowStockItems.length}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Low Stock Alerts */}
        {lowStockItems.length > 0 && (
          <div className="mb-8 p-4 rounded-lg bg-red-50 border border-red-200 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Low Stock Alert</p>
              <p className="text-sm text-red-700">
                {lowStockItems.length} item(s) below threshold. Consider restocking.
              </p>
            </div>
          </div>
        )}

        {/* Add Item Button */}
        {!showForm && (
          <div className="mb-8">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Inventory Item
            </Button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="mb-8">
            <InventoryForm
              contractor={contractor}
              onSave={handleSave}
              onCancel={handleCancel}
              initialData={editingItem}
            />
          </div>
        )}

        {/* Inventory List */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Inventory Items</h2>
          <InventoryList
            items={inventory}
            onEdit={handleEdit}
            onDelete={refetchInventory}
            onRefresh={refetchInventory}
          />
        </div>
      </div>
    </div>
  );
}