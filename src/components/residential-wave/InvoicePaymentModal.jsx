import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';

export default function InvoicePaymentModal({ invoice, isOpen, onClose, onPaymentSuccess }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if running in iframe
      if (window.self !== window.top) {
        setError('Checkout only works from a published app. Please visit the full website.');
        setIsLoading(false);
        return;
      }

      const response = await base44.functions.invoke('createInvoiceCheckout', {
        invoiceId: invoice.id,
        invoiceNumber: invoice.invoice_number,
        customerEmail: invoice.customer_email,
        customerName: invoice.customer_name,
        amount: invoice.total_amount,
        serviceName: invoice.service_description,
      });

      if (response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      } else {
        setError('Failed to create checkout session');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.message || 'Failed to process payment');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Pay Invoice</DialogTitle>
          <DialogDescription>
            Invoice #{invoice?.invoice_number}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Invoice Details */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Service:</span>
              <span className="font-medium">{invoice?.service_description}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Amount:</span>
              <span className="font-medium">${invoice?.total_amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-600">Due Date:</span>
              <span className="font-medium">{invoice?.due_date}</span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Payment Methods Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💳 We accept all major credit and debit cards through secure Stripe checkout.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePayment}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Pay ${invoice?.total_amount?.toFixed(2)}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}