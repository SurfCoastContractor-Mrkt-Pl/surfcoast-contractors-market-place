import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';

export default function ServicePackagesManager({ contractorId }) {
  const [packages, setPackages] = useState([
    {
      id: 1,
      name: 'Basic Consultation',
      description: 'Initial site visit and project assessment',
      price: 50,
      duration: '1 hour',
      type: 'hourly',
      features: ['Site inspection', 'Cost estimate', 'Timeline discussion'],
      active: true
    },
    {
      id: 2,
      name: 'Standard Project',
      description: 'Full project execution with materials included',
      price: 1500,
      duration: 'Fixed price',
      type: 'fixed',
      features: ['Materials included', 'Professional installation', 'Warranty coverage'],
      active: true
    },
    {
      id: 3,
      name: 'Premium Package',
      description: 'Complete solution with premium materials and extended warranty',
      price: 2500,
      duration: 'Fixed price',
      type: 'fixed',
      features: ['Premium materials', 'Extended warranty', '30-day follow-up', 'Free maintenance call'],
      active: false
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);

  const toggleActive = (id) => {
    setPackages(packages.map(p =>
      p.id === id ? { ...p, active: !p.active } : p
    ));
  };

  const deletePackage = (id) => {
    setPackages(packages.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Service Packages</h2>
          <p className="text-sm text-slate-600 mt-1">Create standardized offerings to simplify customer bookings</p>
        </div>
        <Button onClick={() => setShowForm(true)} gap="2">
          <Plus className="w-4 h-4" />
          New Package
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card className="p-6 bg-blue-50 border-blue-200">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingPackage ? 'Edit Package' : 'Create Service Package'}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Package Name</label>
                <input
                  type="text"
                  placeholder="e.g., Basic Consultation"
                  defaultValue={editingPackage?.name || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Pricing Type</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                  <option value="hourly">Hourly</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Price ($)</label>
                <input
                  type="number"
                  placeholder="0.00"
                  defaultValue={editingPackage?.price || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Duration/Scope</label>
                <input
                  type="text"
                  placeholder="e.g., 2 hours, Fixed price"
                  defaultValue={editingPackage?.duration || ''}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
              <textarea
                placeholder="Brief description of what's included..."
                defaultValue={editingPackage?.description || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Features (one per line)</label>
              <textarea
                placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
                defaultValue={editingPackage?.features?.join('\n') || ''}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm h-20 resize-none font-mono text-xs"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => { setShowForm(false); setEditingPackage(null); }}>
                Cancel
              </Button>
              <Button className="bg-blue-600">Save Package</Button>
            </div>
          </div>
        </Card>
      )}

      {/* Packages Grid */}
      {packages.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map(pkg => (
            <Card key={pkg.id} className={`p-6 flex flex-col ${!pkg.active ? 'opacity-60' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{pkg.name}</h3>
                  <Badge variant="outline" className="text-xs mt-1 capitalize">
                    {pkg.type}
                  </Badge>
                </div>
                {pkg.active && (
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
              </div>

              <p className="text-sm text-slate-600 mb-4 line-clamp-2">{pkg.description}</p>

              <div className="mb-4">
                <p className="text-3xl font-bold text-slate-900">${pkg.price}</p>
                <p className="text-xs text-slate-500">{pkg.duration}</p>
              </div>

              {pkg.features.length > 0 && (
                <div className="mb-4 p-3 bg-slate-50 rounded-lg flex-1">
                  <p className="text-xs font-semibold text-slate-700 mb-2">Includes:</p>
                  <ul className="space-y-1">
                    {pkg.features.map((feature, idx) => (
                      <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-slate-200 mt-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleActive(pkg.id)}
                  className="text-xs flex-1"
                >
                  {pkg.active ? 'Deactivate' : 'Activate'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingPackage(pkg)}
                >
                  <Edit2 className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deletePackage(pkg.id)}
                  className="text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No service packages created yet</p>
          <Button onClick={() => setShowForm(true)}>Create Your First Package</Button>
        </Card>
      )}

      {/* Stats */}
      <Card className="p-4 bg-slate-50">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{packages.length}</p>
            <p className="text-xs text-slate-600">Total Packages</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{packages.filter(p => p.active).length}</p>
            <p className="text-xs text-slate-600">Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">
              ${packages.reduce((sum, p) => sum + p.price, 0).toFixed(0)}
            </p>
            <p className="text-xs text-slate-600">Total Value</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{packages.filter(p => p.type === 'fixed').length}</p>
            <p className="text-xs text-slate-600">Fixed Price</p>
          </div>
        </div>
      </Card>
    </div>
  );
}