import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ExampleBanner from '@/components/examples/ExampleBanner';
import useExampleVisibility from '@/hooks/useExampleVisibility';
import { useQuery } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Package, TrendingDown, DollarSign, Plus, ArrowLeft, MapPin } from 'lucide-react';
import InventoryForm from '@/components/contractor/InventoryForm';
import InventoryList from '@/components/contractor/InventoryList';
import LowStockNotifications from '@/components/contractor/LowStockNotifications';
import SupplyHousesFinder from '@/components/contractor/SupplyHousesFinder';

export default function ContractorInventoryDashboard() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [showSupplyHouses, setShowSupplyHouses] = useState(false);

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

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
    shadow: "3px 3px 0px #5C3500",
  };

  if (!user || !contractor) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  const completedJobs = contractor?.completed_jobs_count || 0;
  const { showExamples, toggleExamples, autoHidden } = useExampleVisibility('inventory', completedJobs);

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
    <div style={{ minHeight: "100vh", padding: 24, background: T.bg, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <LowStockNotifications contractorEmail={user?.email} />
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <a href="/WaveFo" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.amber, textDecoration: "none", marginBottom: 16, fontStyle: "italic" }}>
            <ArrowLeft style={{ width: 16, height: 16 }} />
            Back to Wave FO
          </a>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 2.4rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Inventory Management</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>Track materials, monitor stock levels, and manage inventory</p>
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

        {/* Example Entry */}
        <ExampleBanner showExamples={showExamples} onToggle={toggleExamples} autoHidden={autoHidden}>
          <div className="p-5 bg-white rounded-lg border border-amber-200 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-slate-900">PVC Pipe 1-inch</p>
              <p className="text-sm text-slate-500">Category: Plumbing · Supplier: Home Depot</p>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-700">24</p>
                <p className="text-xs text-slate-500">Units in Stock</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">$2.50</p>
                <p className="text-xs text-slate-500">Unit Cost</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700">$60.00</p>
                <p className="text-xs text-slate-500">Total Value</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">In Stock</span>
          </div>
        </ExampleBanner>

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

        {/* Action Buttons */}
        {!showForm && (
          <div className="mb-8 flex gap-3">
            <Button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 hover:bg-blue-700 gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Inventory Item
            </Button>
            <Button
              onClick={() => setShowSupplyHouses(true)}
              variant="outline"
              className="gap-2"
            >
              <MapPin className="w-4 h-4" />
              Find Supply Houses
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

      {/* Supply Houses Modal */}
      <SupplyHousesFinder
        contractor={contractor}
        isOpen={showSupplyHouses}
        onClose={() => setShowSupplyHouses(false)}
      />
    </div>
  );
}