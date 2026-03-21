import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Package, Plus, Trash2, Edit2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductListingForm from './ProductListingForm';

export default function MarketBasket({ shopId }) {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    loadListings();
  }, [shopId]);

  const loadListings = async () => {
    try {
      setLoading(true);
      const items = await base44.entities.MarketListing.filter({ 
        shop_id: shopId,
        status: 'active'
      });
      setListings(items || []);
    } catch (err) {
      console.error('Failed to load listings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this product listing?')) return;
    
    try {
      setDeleting(id);
      await base44.entities.MarketListing.update(id, { status: 'archived' });
      setListings(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Failed to delete listing:', err);
      alert('Failed to remove listing');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-slate-800">My Baskets</h3>
        <Button 
          size="sm" 
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
          onClick={() => setShowForm(true)}
        >
          <Plus className="w-4 h-4" /> Fill My Baskets
        </Button>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white/30 border-2 border-dashed border-white/40 rounded-xl flex flex-col items-center justify-center py-14 text-center">
          <Package className="w-10 h-10 text-slate-300 mb-3" />
          <p className="font-medium text-slate-500">Empty Baskets</p>
          <p className="text-sm text-slate-400 mt-1">Add your first product or service listing to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {listings.map(item => (
            <div key={item.id} className="bg-white rounded-xl p-4 border border-slate-200 hover:shadow-md transition-shadow">
              {/* Image */}
              {item.image_url && (
                <img 
                  src={item.image_url} 
                  alt={item.product_name}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
              )}

              {/* Content */}
              <h4 className="font-semibold text-slate-900 mb-1">{item.product_name}</h4>
              <p className="text-sm text-slate-500 mb-2">{item.category}</p>
              
              {item.description && (
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{item.description}</p>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-slate-900">${item.price}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">{item.unit}</span>
              </div>

              {item.quantity_available && (
                <p className="text-xs text-slate-600 mb-3">Available: {item.quantity_available}</p>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-slate-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-slate-600 hover:text-slate-900"
                  onClick={() => setEditingItem(item)}
                >
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : (
                    <Trash2 className="w-4 h-4 mr-1" />
                  )}
                  Remove
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <ProductListingForm
          shopId={shopId}
          onClose={() => setShowForm(false)}
          onSuccess={loadListings}
        />
      )}

      {editingItem && (
        <ProductListingForm
          shopId={shopId}
          listing={editingItem}
          onClose={() => setEditingItem(null)}
          onSuccess={() => {
            setEditingItem(null);
            loadListings();
          }}
        />
      )}
    </div>
  );
}