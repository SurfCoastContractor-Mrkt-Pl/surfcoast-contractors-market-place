import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Download, AlertCircle } from 'lucide-react';

export default function BillingHistory() {
  const [subscription, setSubscription] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await base44.auth.me();
        if (!user) {
          navigate('/');
          return;
        }

        const subs = await base44.entities.Subscription.filter({ user_email: user.email });
        if (subs.length > 0) {
          setSubscription(subs[0]);

          // Fetch invoices from Stripe via backend
          try {
            const response = await base44.functions.invoke('getSubscriptionInvoices', {
              stripeCustomerId: subs[0].stripe_customer_id,
            });
            setInvoices(response.data?.invoices || []);
          } catch (err) {
            console.error('Error fetching invoices:', err);
            // Don't block UI if invoices fail
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Error loading billing:', err);
        setError('Failed to load billing information');
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="p-4 bg-destructive/10 border-2 border-destructive rounded-lg flex gap-3">
            <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <p className="text-destructive">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-foreground mb-4">Billing History</h1>
            <p className="text-muted-foreground mb-6">No active subscription found.</p>
            <a href="/SubscriptionUpgrade" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90">
              Subscribe Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-foreground mb-2">Billing & History</h1>
          <p className="text-muted-foreground">Manage your subscription and view payment history.</p>
        </div>

        {/* Current Subscription */}
        <div className="bg-card border-2 border-border rounded-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Current Subscription</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <p className="text-muted-foreground mb-2">Plan</p>
              <p className="text-2xl font-bold text-foreground capitalize">{subscription.tier}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Monthly Cost</p>
              <p className="text-2xl font-bold text-foreground">${(subscription.amount_cents / 100).toFixed(2)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Status</p>
              <p className={`text-lg font-bold capitalize ${
                subscription.status === 'active' ? 'text-secondary' : 'text-destructive'
              }`}>
                {subscription.status}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-2">Next Billing Date</p>
              <p className="text-lg font-bold text-foreground">
                {new Date(subscription.billing_cycle_end).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <a
              href="/SubscriptionUpgrade"
              className="px-6 py-2 rounded-lg bg-primary text-white font-semibold hover:opacity-90"
            >
              Change Plan
            </a>
            <button className="px-6 py-2 rounded-lg border-2 border-border font-semibold hover:bg-muted">
              Cancel Subscription
            </button>
          </div>
        </div>

        {/* Invoice History */}
        <div className="bg-card border-2 border-border rounded-lg p-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Invoice History</h2>

          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Description</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Amount</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Status</th>
                    <th className="text-right py-3 px-4 font-semibold text-foreground">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((invoice, idx) => (
                    <tr key={idx} className="border-b border-border hover:bg-muted/50">
                      <td className="py-4 px-4">{new Date(invoice.created * 1000).toLocaleDateString()}</td>
                      <td className="py-4 px-4">Monthly Subscription</td>
                      <td className="text-right py-4 px-4 font-semibold">${(invoice.total / 100).toFixed(2)}</td>
                      <td className="text-right py-4 px-4">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          invoice.paid ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'
                        }`}>
                          {invoice.paid ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        {invoice.invoice_pdf && (
                          <a
                            href={invoice.invoice_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-primary hover:opacity-70"
                          >
                            <Download className="w-4 h-4" />
                            PDF
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">No invoices yet. Your first invoice will appear after your first billing cycle.</p>
          )}
        </div>
      </div>
    </div>
  );
}