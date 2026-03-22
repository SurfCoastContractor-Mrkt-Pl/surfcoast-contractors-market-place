import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import BookingConfirmation from './BookingConfirmation';

export default function BookingRequestForm({ market, isOpen, onClose }) {
  const [step, setStep] = useState('form'); // 'form', 'confirmation'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingData, setBookingData] = useState({
    market_id: market?.id || '',
    market_name: market?.shop_name || '',
    date: '',
    time: '',
    name: '',
    email: '',
    phone: ''
  });
  const [confirmationData, setConfirmationData] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBookingData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!bookingData.date || !bookingData.time || !bookingData.name || !bookingData.email || !bookingData.phone) {
      setError('Please fill in all fields');
      return;
    }

    // Show confirmation
    setConfirmationData(bookingData);
    setStep('confirmation');
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const booking = await base44.entities.BookingRequest.create({
        market_id: bookingData.market_id,
        market_name: bookingData.market_name,
        visitor_name: bookingData.name,
        visitor_email: bookingData.email,
        visitor_phone: bookingData.phone,
        requested_date: bookingData.date,
        requested_time: bookingData.time,
        status: 'pending',
        requested_at: new Date().toISOString()
      });

      // Success - show confirmation with booking ID
      setConfirmationData(prev => ({ ...prev, bookingId: booking.id }));
    } catch (err) {
      setError('Failed to create booking. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep('form');
    setBookingData({
      market_id: market?.id || '',
      market_name: market?.shop_name || '',
      date: '',
      time: '',
      name: '',
      email: '',
      phone: ''
    });
    setConfirmationData(null);
    setError('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        {step === 'form' ? (
          <>
            <DialogHeader>
              <DialogTitle>Book a Visit</DialogTitle>
              <DialogDescription>
                Reserve a time slot to visit {market?.shop_name}
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Market Info (read-only) */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <p className="text-sm font-medium text-slate-900">{market?.shop_name}</p>
                <p className="text-xs text-slate-600">{market?.city}, {market?.state}</p>
              </div>

              {/* Date Selection */}
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Date
                </label>
                <Input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="w-full"
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Time
                </label>
                <Input
                  type="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleInputChange}
                  required
                  className="w-full"
                />
              </div>

              {/* Visitor Info */}
              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">Name</label>
                <Input
                  type="text"
                  name="name"
                  value={bookingData.name}
                  onChange={handleInputChange}
                  placeholder="Your name"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">Email</label>
                <Input
                  type="email"
                  name="email"
                  value={bookingData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  required
                  className="w-full"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-900 block mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  required
                  className="w-full"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Review Booking
                </Button>
              </div>
            </form>
          </>
        ) : (
          <BookingConfirmation
            booking={confirmationData}
            onConfirm={handleConfirm}
            onCancel={() => setStep('form')}
            loading={loading}
            error={error}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}