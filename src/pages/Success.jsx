import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2, MessageCircle } from 'lucide-react';

export default function Success() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [isQuote, setIsQuote] = useState(false);
  const [quoteContractorName, setQuoteContractorName] = useState('');
  const [isTimed, setIsTimed] = useState(false);
  const [timedContractorEmail, setTimedContractorEmail] = useState('');
  const [timedContractorName, setTimedContractorName] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [payerEmail, setPayerEmail] = useState('');
  const [confirmed, setConfirmed] = useState(false); // user clicked OK

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const pId = urlParams.get('payment_id');
    const quoteMetaRaw = urlParams.get('quote_meta');
    const tierParam = urlParams.get('tier');
    const contractorEmail = urlParams.get('contractor_email');
    const contractorName = urlParams.get('contractor_name');

    setPaymentId(pId || '');

    if (tierParam === 'timed') {
      setIsTimed(true);
      setTimedContractorEmail(contractorEmail || '');
      setTimedContractorName(contractorName || '');
    }

    if (!pId) {
      setError('No payment ID found. Please contact support.');
      setIsVerifying(false);
      return;
    }

    const verifyAndFinalize = async () => {
      try {
        // Poll for confirmed status
        let payment = null;
        const maxAttempts = 15;
        let delayMs = 500;

        for (let i = 0; i < maxAttempts; i++) {
          try {
            const result = await base44.functions.invoke('verifyPayment', { payment_id: pId });
            const p = result?.data?.payment;
            if (p) {
              payment = p;
              if (p.status === 'confirmed') break;
            }
          } catch (fetchErr) {
            console.warn(`Attempt ${i + 1} error:`, fetchErr.message);
          }
          if (i < maxAttempts - 1) {
            await new Promise(r => setTimeout(r, delayMs));
            delayMs = Math.min(delayMs + 250, 1000);
          }
        }

        if (payment?.payer_email) {
          setPayerEmail(payment.payer_email);
        }

        if (payment?.status === 'expired') {
          setError('This payment session has expired. Please try again.');
          return;
        }

        // Handle quote request creation
        if (quoteMetaRaw) {
          try {
            const quoteMeta = JSON.parse(decodeURIComponent(quoteMetaRaw));
            await base44.functions.invoke('createQuoteRequest', {
              payment_id: pId,
              contractor_id: quoteMeta.contractor_id,
              contractor_name: quoteMeta.contractor_name,
              contractor_email: quoteMeta.contractor_email,
              customer_email: quoteMeta.customer_email,
              customer_name: quoteMeta.customer_name,
              work_description: quoteMeta.work_description,
              job_id: quoteMeta.job_id || '',
              job_title: quoteMeta.job_title || '',
            });
            setQuoteContractorName(quoteMeta.contractor_name || '');
            setIsQuote(true);
          } catch {
            setIsQuote(true);
          }
        }

        // Create TimedChatSession for timed payments
        if (tierParam === 'timed' && payment?.status === 'confirmed') {
          try {
            const sessionRes = await base44.functions.invoke('createTimedChatSession', {
              payment_id: pId,
              contractor_id: urlParams.get('contractor_id') || '',
              contractor_name: contractorName || '',
              contractor_email: contractorEmail || '',
              customer_email: payment.payer_email,
              customer_name: payment.payer_name || '',
            });
            const sessionId = sessionRes?.data?.session?.id;
            if (sessionId) {
              // Store for redirect
              window.__timedChatSessionId = sessionId;
            }
          } catch (sessionErr) {
            console.warn('Could not create timed chat session:', sessionErr.message);
          }
        }

        // Send receipt email for timed sessions
        if (tierParam === 'timed' && payment?.payer_email) {
          try {
            await base44.integrations.Core.SendEmail({
              to: payment.payer_email,
              subject: 'Your SurfCoast Payment Receipt – 10-Minute Chat Session',
              body: `
Hi ${payment.payer_name || 'there'},

Thank you for your payment! Here is your receipt:

━━━━━━━━━━━━━━━━━━━━━━━━━━
PAYMENT RECEIPT
━━━━━━━━━━━━━━━━━━━━━━━━━━
Service: 10-Minute Chat Session
Contractor: ${contractorName || 'Contractor'}
Amount Charged: $1.50 USD
Payment ID: ${pId}
Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━

Your 10-minute messaging session is now active. You can begin chatting with ${contractorName || 'the contractor'} immediately.

This fee is non-refundable. All payment arrangements for work performed are solely between you and the contractor.

Thank you for using SurfCoast Marketplace.

– The SurfCoast Team
              `.trim(),
            });
          } catch (emailErr) {
            console.warn('Receipt email failed:', emailErr.message);
          }
        }

      } catch (err) {
        console.error('Verification error:', err);
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndFinalize();
  }, []);

  const handleGoToChat = () => {
    const sessionId = window.__timedChatSessionId;
    if (sessionId) {
      navigate(`/timed-chat/${sessionId}`);
    } else {
      // Fallback
      navigate(`/Messaging?with=${encodeURIComponent(timedContractorEmail)}&name=${encodeURIComponent(timedContractorName)}&tier=timed&payment_id=${paymentId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center shadow-xl">
        {isVerifying ? (
          <>
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Processing Payment</h1>
            <p className="text-slate-600">Please wait while we confirm your payment...</p>
          </>
        ) : error ? (
          <>
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-red-900 mb-2">Payment Error</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white w-full">
              Go Back
            </Button>
          </>
        ) : (
          // ── CONFIRMATION — stays on page until user clicks X ──
          // Fixed overlay modal on top of the success page
          <>
            {/* Background page content (blurred) */}
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5 opacity-30">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-slate-400 text-sm opacity-30">Processing complete</p>

            {/* Fixed confirmation modal overlay */}
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
                {/* X close button */}
                <button
                  onClick={() => setConfirmed(true)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle className="w-10 h-10 text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Payment Confirmed!</h2>
                  <p className="text-slate-600 text-sm mb-6">
                    {isQuote
                      ? 'Your quote request has been submitted. The contractor will respond within 48 hours.'
                      : isTimed
                        ? `Your 10-minute chat session with ${timedContractorName} is ready. A receipt has been sent to your email.`
                        : 'Your access has been activated. A receipt has been sent to your email.'}
                  </p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Service:</span>
                    <span className="font-semibold text-slate-900">
                      {isQuote ? 'Quote Request' : isTimed ? '10-Minute Chat Session' : 'Platform Access'}
                    </span>
                  </div>
                  {isTimed && timedContractorName && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Contractor:</span>
                      <span className="font-semibold text-slate-900">{timedContractorName}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Amount Charged:</span>
                    <span className="font-bold text-green-700">{isTimed ? '$1.50' : isQuote ? '$1.75' : '$50.00'} USD</span>
                  </div>
                  {payerEmail && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Receipt sent to:</span>
                      <span className="font-semibold text-slate-900 break-all">{payerEmail}</span>
                    </div>
                  )}
                </div>

                {isTimed && timedContractorEmail ? (
                  <Button
                    onClick={() => { setConfirmed(true); setTimeout(handleGoToChat, 50); }}
                    className="w-full text-white text-base font-semibold py-5"
                    style={{ backgroundColor: '#1E5A96' }}
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Messaging {timedContractorName}
                  </Button>
                ) : (
                  <Button
                    onClick={() => setConfirmed(true)}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-5"
                  >
                    {isQuote ? 'View Your Quotes' : 'Continue'}
                  </Button>
                )}

                <p className="text-center text-xs text-slate-400 mt-4">
                  Click the ✕ or the button above to dismiss this message
                </p>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}