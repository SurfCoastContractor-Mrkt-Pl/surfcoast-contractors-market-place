import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useNavigate } from 'react-router-dom';
import { Download, AlertCircle } from 'lucide-react';
import SubscriptionStatusCard from '@/components/subscription/SubscriptionStatusCard';
import PaymentMethodManager from '@/components/subscription/PaymentMethodManager';

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

  const T = {
    bg: "#EBEBEC",
    card: "#fff",
    dark: "#1A1A1B",
    muted: "#555",
    border: "#D0D0D2",
    amber: "#5C3500",
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ width: 32, height: 32, border: "3px solid #D0D0D2", borderTop: "3px solid " + T.dark, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 48, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ padding: 16, background: "#FBF5EC", border: "0.5px solid #D9B88A", borderRadius: 8, display: "flex", gap: 12 }}>
            <AlertCircle style={{ width: 20, height: 20, color: T.amber, flexShrink: 0, marginTop: 2 }} />
            <p style={{ color: T.amber, fontStyle: "italic" }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!subscription) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 48, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 800, color: T.dark, margin: "0 0 16px 0", fontStyle: "italic" }}>Billing History</h1>
            <p style={{ color: T.muted, marginBottom: 24, fontStyle: "italic" }}>No active subscription found.</p>
            <a href="/SubscriptionUpgrade" className="inline-block px-6 py-2 bg-primary text-white rounded-lg hover:opacity-90">
              Subscribe Now
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, paddingTop: 48, paddingBottom: 48, paddingLeft: 16, paddingRight: 16, fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <div style={{ maxWidth: 1024, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{ fontSize: "clamp(1.6rem, 5vw, 2rem)", fontWeight: 800, color: T.dark, margin: "0 0 8px 0", fontStyle: "italic" }}>Billing & History</h1>
          <p style={{ color: T.muted, fontStyle: "italic" }}>Manage your subscription and view payment history.</p>
        </div>

        {/* Current Subscription & Payment Methods */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SubscriptionStatusCard
            subscription={subscription}
            onChangePlan={() => window.location.href = '/SubscriptionUpgrade'}
          />
          <PaymentMethodManager userEmail={user?.email} />
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