import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, AlertCircle, Loader2 } from 'lucide-react';

export default function ServiceSelector({ contractorEmail, onServicesSelected, onCancel }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedServices, setSelectedServices] = useState([]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await base44.entities.QuoteService.filter({
          contractor_email: contractorEmail,
          is_active: true
        });
        setServices(data || []);
      } catch (err) {
        setError('Failed to load services');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [contractorEmail]);

  const handleAddService = (service) => {
    setSelectedServices([
      ...selectedServices,
      {
        id: service.id,
        service_name: service.service_name,
        price_amount: service.price_type === 'hourly' ? service.estimated_hours || 1 : service.price_amount,
        quantity: service.price_type === 'hourly' ? 1 : 1,
        price_type: service.price_type,
        estimated_hours: service.estimated_hours
      }
    ]);
  };

  const handleRemoveService = (index) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index));
  };

  const handleQuantityChange = (index, value) => {
    const newServices = [...selectedServices];
    newServices[index].quantity = parseFloat(value) || 1;
    setSelectedServices(newServices);
  };

  const calculateTotal = () => {
    return selectedServices.reduce((sum, service) => {
      return sum + (service.price_amount * service.quantity);
    }, 0);
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      setError('Please select at least one service');
      return;
    }
    onServicesSelected({
      services: selectedServices,
      notes,
      total: calculateTotal()
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-slate-400 mr-2" />
        <p className="text-slate-600">Loading services...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {/* Available Services */}
      {services.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Available Services</h4>
          <div className="grid gap-2 max-h-48 overflow-y-auto">
            {services.map((service) => (
              <Card key={service.id} className="p-3 flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-slate-900 text-sm">{service.service_name}</p>
                  <p className="text-xs text-slate-600 line-clamp-1">{service.description}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {service.price_type === 'hourly' ? `$${service.price_amount}/hr` : `$${service.price_amount}`}
                    </Badge>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleAddService(service)}
                  className="flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      {services.length === 0 && (
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center text-slate-600 text-sm">
          No services available. Please create some services first.
        </div>
      )}

      {/* Selected Services */}
      {selectedServices.length > 0 && (
        <div>
          <h4 className="font-semibold text-slate-900 mb-3">Selected Services</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {selectedServices.map((service, idx) => (
              <Card key={idx} className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 text-sm">{service.service_name}</p>
                    <div className="flex gap-2 mt-2">
                      <div className="flex-1">
                        <label className="text-xs text-slate-600">Qty</label>
                        <Input
                          type="number"
                          min="1"
                          step="0.5"
                          value={service.quantity}
                          onChange={(e) => handleQuantityChange(idx, e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-600">Unit Price</label>
                        <p className="text-sm font-medium text-slate-900 h-8 flex items-center">
                          ${service.price_amount.toFixed(2)}
                        </p>
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-slate-600">Amount</label>
                        <p className="text-sm font-medium text-slate-900 h-8 flex items-center">
                          ${(service.price_amount * service.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemoveService(idx)}
                    className="flex-shrink-0 text-red-600 hover:text-red-700"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-slate-900 mb-1">
          Additional Notes (Optional)
        </label>
        <textarea
          placeholder="Add any additional details or terms..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>

      {/* Total */}
      {selectedServices.length > 0 && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-slate-600">Quote Total</p>
          <p className="text-2xl font-bold text-blue-600">${calculateTotal().toFixed(2)}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={selectedServices.length === 0}
          className="flex-1"
        >
          Generate Quote
        </Button>
      </div>
    </div>
  );
}