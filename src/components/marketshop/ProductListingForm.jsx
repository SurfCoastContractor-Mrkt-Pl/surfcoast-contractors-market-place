import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Upload, Loader2 } from 'lucide-react';

export default function ProductListingForm({ shopId, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    product_name: '',
    category: 'vegetables',
    description: '',
    price: '',
    unit: 'per lb',
    quantity_available: '',
    image_url: '',
  });
  const [imageLoading, setImageLoading] = useState(false);

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setImageLoading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData(prev => ({ ...prev, image_url: file_url }));
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image');
    } finally {
      setImageLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.product_name || !formData.price) {
      alert('Product name and price are required');
      return;
    }

    setLoading(true);
    try {
      await base44.entities.MarketListing.create({
        shop_id: shopId,
        product_name: formData.product_name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        unit: formData.unit,
        quantity_available: formData.quantity_available ? parseInt(formData.quantity_available) : null,
        image_url: formData.image_url,
        status: 'active',
      });
      
      alert('Product listed successfully!');
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error('Failed to create listing:', err);
      alert('Failed to create product listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 p-4 sm:p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Add Product Listing</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Name *</label>
            <Input
              type="text"
              placeholder="e.g., Fresh Tomatoes"
              value={formData.product_name}
              onChange={(e) => setFormData(prev => ({ ...prev, product_name: e.target.value }))}
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="herbs">Herbs & Plants</option>
              <option value="dairy">Dairy</option>
              <option value="meat">Meat & Poultry</option>
              <option value="baked">Baked Goods</option>
              <option value="preserves">Preserves & Jams</option>
              <option value="crafts">Crafts & Handmade</option>
              <option value="flowers">Flowers & Plants</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <Textarea
              placeholder="Describe your product, growing methods, special qualities..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Price & Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Price *</label>
              <Input
                type="number"
                placeholder="0.00"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Unit</label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="per lb">Per lb</option>
                <option value="per dozen">Per dozen</option>
                <option value="per bunch">Per bunch</option>
                <option value="per item">Per item</option>
                <option value="per pint">Per pint</option>
              </select>
            </div>
          </div>

          {/* Quantity Available */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Quantity Available</label>
            <Input
              type="number"
              placeholder="e.g., 50 (optional)"
              value={formData.quantity_available}
              onChange={(e) => setFormData(prev => ({ ...prev, quantity_available: e.target.value }))}
              min="0"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Product Image</label>
            <div className="flex items-center gap-3">
              <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-blue-400 transition-colors">
                {imageLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                ) : (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Upload className="w-5 h-5" />
                    <span className="text-sm font-medium">Upload Image</span>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={imageLoading}
                  className="hidden"
                />
              </label>
              {formData.image_url && (
                <img src={formData.image_url} alt="Preview" className="w-16 h-16 rounded-lg object-cover" />
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !formData.product_name || !formData.price}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? 'Listing...' : 'List Product'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}