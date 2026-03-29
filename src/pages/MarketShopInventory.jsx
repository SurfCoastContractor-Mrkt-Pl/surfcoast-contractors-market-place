import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import ExampleBanner from '@/components/examples/ExampleBanner';
import useExampleVisibility from '@/hooks/useExampleVisibility';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Loader2, Plus, Edit2, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function MarketShopInventory() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [listings, setListings] = useState([]);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    product_name: '',
    description: '',
    price: '',
    unit: '',
    stock_level: '',
    low_stock_threshold: 5,
    category: '',
  });

  const { showExamples, toggleExamples, autoHidden } = useExampleVisibility('market_inventory', listings.length, 10);

  // Load user and listings
  useEffect(() => {
    const loadData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const userListings = await base44.entities.MarketListing.filter({
          shop_email: currentUser.email,
        });

        setListings(userListings || []);
        setLoading(false);
      } catch (err) {
        console.error('Error loading inventory:', err);
        setError('Failed to load inventory.');
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAddProduct = () => {
    setFormData({
      product_name: '',
      description: '',
      price: '',
      unit: '',
      stock_level: '',
      low_stock_threshold: 5,
      category: '',
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleEditProduct = (listing) => {
    setFormData({
      product_name: listing.product_name,
      description: listing.description || '',
      price: listing.price.toString(),
      unit: listing.unit || '',
      stock_level: listing.stock_level.toString(),
      low_stock_threshold: listing.low_stock_threshold,
      category: listing.category || '',
    });
    setEditingId(listing.id);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload = {
        product_name: formData.product_name,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        stock_level: parseInt(formData.stock_level),
        low_stock_threshold: parseInt(formData.low_stock_threshold),
        category: formData.category,
        shop_email: user.email,
      };

      if (editingId) {
        // Update existing
        const updated = await base44.entities.MarketListing.update(editingId, payload);
        setListings(listings.map((l) => (l.id === editingId ? updated : l)));
      } else {
        // Get shop
        const shops = await base44.entities.MarketShop.filter({ email: user.email });
        if (!shops || shops.length === 0) {
          setError('No shop found. Please create a shop first.');
          setSubmitting(false);
          return;
        }

        // Create new
        const newListing = await base44.entities.MarketListing.create({
          ...payload,
          shop_id: shops[0].id,
        });
        setListings([...listings, newListing]);
      }

      setShowForm(false);
      setSubmitting(false);
    } catch (err) {
      console.error('Error saving product:', err);
      setError('Failed to save product.');
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      await base44.entities.MarketListing.delete(id);
      setListings(listings.filter((l) => l.id !== id));
    } catch (err) {
      console.error('Error deleting product:', err);
      setError('Failed to delete product.');
    }
  };

  const handleUpdateStock = async (id, newStock) => {
    try {
      const updated = await base44.functions.invoke('updateProductStock', {
        listing_id: id,
        new_stock_level: newStock,
      });

      setListings(listings.map((l) => (l.id === id ? updated.data.listing : l)));
    } catch (err) {
      console.error('Error updating stock:', err);
      setError('Failed to update stock.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Please Log In</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-4">You need to log in to manage your inventory.</p>
            <Button onClick={() => base44.auth.redirectToLogin()} className="w-full">
              Log In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Inventory Management</h1>
            <p className="text-slate-600 mt-1">Track stock levels, manage pricing, and receive low-stock alerts</p>
          </div>
          <Button onClick={handleAddProduct} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Product
          </Button>
        </div>

        {/* Example Entry */}
        <ExampleBanner showExamples={showExamples} onToggle={toggleExamples} autoHidden={autoHidden}>
          <div className="p-5 bg-white rounded-lg border border-amber-200 flex items-start justify-between gap-4 flex-wrap">
            <div>
              <p className="font-semibold text-slate-900">Fresh Strawberries</p>
              <p className="text-sm text-slate-500">Category: Fruit · Unit: lb</p>
              <p className="text-sm text-slate-500 mt-1">Low stock alert at: 5 lbs</p>
            </div>
            <div className="flex gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-green-700">32</p>
                <p className="text-xs text-slate-500">Units in Stock</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-700">$4.99</p>
                <p className="text-xs text-slate-500">Price per lb</p>
              </div>
            </div>
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full self-center">In Stock</span>
          </div>
        </ExampleBanner>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Error</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>{editingId ? 'Edit Product' : 'Add New Product'}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">
                      Product Name *
                    </label>
                    <Input
                      type="text"
                      value={formData.product_name}
                      onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                      placeholder="e.g., Fresh Tomatoes"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Category</label>
                    <Input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Vegetables"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Price ($) *</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0.00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Unit</label>
                    <Input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g., lb, dozen, each"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">Stock Level *</label>
                    <Input
                      type="number"
                      value={formData.stock_level}
                      onChange={(e) => setFormData({ ...formData, stock_level: e.target.value })}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1">
                      Low Stock Alert Threshold
                    </label>
                    <Input
                      type="number"
                      value={formData.low_stock_threshold}
                      onChange={(e) => setFormData({ ...formData, low_stock_threshold: e.target.value })}
                      placeholder="5"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Product details..."
                    rows="3"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={submitting}>
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    {editingId ? 'Update Product' : 'Add Product'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Inventory List */}
        {listings.length === 0 ? (
          <Card>
            <CardContent className="pt-12 pb-12 text-center">
              <p className="text-slate-600 mb-4">No products yet. Add your first product to get started.</p>
              <Button onClick={handleAddProduct} variant="outline">
                Add Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {listings.map((listing) => (
              <Card key={listing.id} className="bg-white">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-base">{listing.product_name}</CardTitle>
                      {listing.category && <p className="text-xs text-slate-500 mt-1">{listing.category}</p>}
                    </div>
                    {!listing.is_visible && (
                      <div className="bg-red-100 text-red-700 text-xs font-semibold px-2 py-1 rounded">
                        Hidden
                      </div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Stock Status */}
                  <div>
                    <p className="text-sm text-slate-600 mb-2">Stock Level</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <div className="text-2xl font-bold text-slate-900">{listing.stock_level}</div>
                        <p className="text-xs text-slate-500">{listing.unit || 'units'}</p>
                      </div>
                      {listing.stock_level <= listing.low_stock_threshold && listing.stock_level > 0 && (
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                      )}
                      {listing.stock_level === 0 && <AlertCircle className="w-5 h-5 text-red-600" />}
                      {listing.stock_level > listing.low_stock_threshold && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <p className="text-sm text-slate-600">Price</p>
                    <p className="text-lg font-semibold text-slate-900">${listing.price.toFixed(2)}</p>
                  </div>

                  {/* Low Stock Threshold */}
                  <div>
                    <p className="text-xs text-slate-500">Low Stock Alert: {listing.low_stock_threshold} {listing.unit || 'units'}</p>
                  </div>

                  {/* Quick Stock Update */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-600">Update Stock</label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        id={`stock-${listing.id}`}
                        defaultValue={listing.stock_level}
                        min="0"
                        className="text-sm"
                      />
                      <Button
                        size="sm"
                        onClick={() => {
                          const input = document.getElementById(`stock-${listing.id}`);
                          handleUpdateStock(listing.id, parseInt(input.value));
                        }}
                        className="px-3"
                      >
                        Update
                      </Button>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditProduct(listing)}
                      className="flex-1 gap-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(listing.id)}
                      className="flex-1 gap-1 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}