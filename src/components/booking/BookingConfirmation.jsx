import React from 'react';
import { Button } from '@/components/ui/button';
import { DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function BookingConfirmation({ booking, onConfirm, onCancel, loading, error }) {
  // If booking is confirmed, show success state
  if (booking?.bookingId) {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="text-center text-green-600 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            Booking Confirmed!
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium text-slate-900">Your booking request has been submitted.</p>
            <p className="text-xs text-slate-600">Confirmation ID: <span className="font-mono font-semibold text-slate-900">{booking.bookingId}</span></p>
          </div>

          <div className="space-y-3">
            <div>
              <p className="text-xs text-slate-500 uppercase">Market</p>
              <p className="text-sm font-medium text-slate-900">{booking.market_name}</p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Requested Date & Time</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {booking.time}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase">Status</p>
              <p className="text-sm font-medium text-slate-900">Pending Confirmation</p>
            </div>
          </div>

          <p className="text-xs text-slate-600 text-center">
            The market will review your request and send confirmation to <span className="font-medium">{booking.email}</span>
          </p>

          <Button onClick={onCancel} className="w-full">
            Done
          </Button>
        </div>
      </>
    );
  }

  // Review form state
  return (
    <>
      <DialogHeader>
        <DialogTitle>Confirm Your Booking</DialogTitle>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-3 bg-slate-50 p-4 rounded-lg">
          <div>
            <p className="text-xs text-slate-500 uppercase">Market</p>
            <p className="text-sm font-medium text-slate-900">{booking.market_name}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Date & Time</p>
            <p className="text-sm font-medium text-slate-900">
              {new Date(booking.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })} at {booking.time}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase">Contact Info</p>
            <p className="text-sm font-medium text-slate-900">{booking.name}</p>
            <p className="text-xs text-slate-600">{booking.email} • {booking.phone}</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex gap-2 text-sm text-red-700">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            {error}
          </div>
        )}

        <p className="text-xs text-slate-600">
          By confirming, you're requesting a booking slot. The market will contact you to confirm availability.
        </p>

        <div className="flex gap-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="flex-1"
          >
            Back
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Confirming...
              </>
            ) : (
              'Confirm Booking'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}