import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Download, FileText, Calendar, DollarSign, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ContractorBillingHistory() {
  const [user, setUser] = useState(null);
  const [payments, setPayments] = useState([]);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  useEffect(() => {
    const init = async () => {
      try {
        const isAuthed = await base44.auth.isAuthenticated();
        if (!isAuthed) {
          setLoading(false);
          return;
        }

        const me = await base44.auth.me();
        setUser(me);

        // Fetch confirmed payments (communication fees)
        const paymentData = await base44.entities.Payment.filter({
          payer_email: me.email,
          status: 'confirmed'
        });
        setPayments(paymentData?.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)) || []);

        // Fetch subscription
        const subData = await base44.entities.Subscription.filter({
          email: me.email
        });
        if (subData?.length > 0) {
          setSubscription(subData[0]);
        }
      } catch (error) {
        console.error('Error loading billing data:', error);
      }
      setLoading(false);
    };

    init();
  }, []);

  const handleDownloadReceipt = async (paymentId) => {
    setDownloadingId(paymentId);
    try {
      const receipt = await base44.functions.invoke('generatePaymentInvoice', {
        payment_id: paymentId
      });

      if (receipt?.url) {
        const link = document.createElement('a');
        link.href = receipt.url;
        link.download = `receipt_${paymentId}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Error downloading receipt:', error);
      alert('Failed to download receipt. Please try again.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center text-white">
          <Loader className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading billing information...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center text-white max-w-sm">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
          <p className="text-slate-400 mb-6">You need to be signed in to view your billing history.</p>
          <button
            onClick={() => base44.auth.redirectToLogin()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Sign In
          </button>
          <Link to="/" className="block mt-4 text-slate-400 text-sm hover:text-white">← Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link to="/FieldOps" className="text-blue-400 text-sm font-semibold mb-4 inline-flex items-center gap-1 hover:text-blue-300">
            ← Back to Field Ops
          </Link>
          <h1 className="text-4xl font-bold text-white">Billing & History</h1>
          <p className="text-slate-400 mt-2">Manage your payments and subscriptions</p>
        </div>

        {/* Subscription Status Card */}
        {subscription && (
          <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 mb-8">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  {subscription.status === 'active' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      Active Subscription
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-yellow-400" />
                      Subscription Inactive
                    </>
                  )}
                </h2>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                subscription.status === 'active'
                  ? 'bg-green-900/40 text-green-400'
                  : 'bg-yellow-900/40 text-yellow-400'
              }`}>
                {subscription.status?.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Plan</p>
                <p className="text-white font-semibold text-lg">$50/month</p>
                <p className="text-slate-500 text-sm mt-1">Subscription Communication</p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Renewed</p>
                <p className="text-white font-semibold text-lg">
                  {subscription.renewal_date ? new Date(subscription.renewal_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                </p>
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase mb-1">Joined</p>
                <p className="text-white font-semibold text-lg">
                  {new Date(subscription.created_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Payment History */}
        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-400" />
            Communication Payment History
          </h2>

          {payments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-500 font-medium">No payments found</p>
              <p className="text-slate-600 text-sm mt-1">Your communication payments will appear here</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payments.map(payment => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-4 bg-slate-800/50 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <Calendar className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <p className="text-white font-semibold">
                        {payment.purpose || 'Limited Communication'}
                      </p>
                      <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-1 rounded">One-time</span>
                    </div>
                    <p className="text-slate-400 text-sm">
                      {new Date(payment.created_date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">${payment.amount.toFixed(2)}</p>
                      <p className="text-slate-400 text-xs">
                        {payment.status === 'confirmed' ? 'Confirmed' : payment.status}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownloadReceipt(payment.id)}
                      disabled={downloadingId === payment.id}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {downloadingId === payment.id ? (
                        <>
                          <Loader className="w-4 h-4 animate-spin" />
                          Downloading...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Receipt
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {payments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-700">
              <p className="text-slate-400 text-sm">
                📋 All receipts are automatically generated for your tax records. Download and keep them for your records.
              </p>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-slate-900/50 rounded-lg p-4 border border-slate-800">
          <p className="text-slate-400 text-sm">
            <span className="font-semibold text-white">Need help?</span> Contact support at support@surfcoast.com or use the feedback form in Field Ops.
          </p>
        </div>
      </div>
    </div>
  );
}