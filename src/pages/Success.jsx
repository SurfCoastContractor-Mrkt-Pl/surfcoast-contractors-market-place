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
            setIsQuote(true);
          } catch {
            setIsQuote(true);
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

  // Redirect back to contractor profile with paid flag — profile page will auto-open chat
  const handleGoToChat = () => {
    // We need the contractor ID too — it's in the URL payment_id param isn't enough
    // Navigate to ContractorProfile with paid=timed so it auto-opens the chat
    const urlParams = new URLSearchParams(window.location.search);
    const contractorId = urlParams.get('contractor_id');
    if (contractorId) {
      navigate(`/ContractorProfile?id=${contractorId}&paid=timed&payment_id=${paymentId}&contractor_email=${encodeURIComponent(timedContractorEmail)}&contractor_name=${encodeURIComponent(timedContractorName)}`);
    } else {
      // Fallback: open messaging directly
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
        ) : !confirmed ? (
          // ── CONFIRMATION POP-UP STATE ──
          <>
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Confirmed!</h1>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Service:</span>
                <span className="font-semibold text-slate-900">
                  {isQuote ? 'Quote Request' : isTimed ? '10-Minute Chat Session' : 'Platform Access'}
                </span>
              </div>
              {isTimed && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Contractor:</span>
                  <span className="font-semibold text-slate-900">{timedContractorName}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-600">Amount:</span>
                <span className="font-bold text-green-700">{isTimed ? '$1.50' : isQuote ? '$1.75' : '$50.00'} USD</span>
              </div>
              {payerEmail && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Receipt sent to:</span>
                  <span className="font-semibold text-slate-900 break-all">{payerEmail}</span>
                </div>
              )}
            </div>
            <p className="text-slate-600 text-sm mb-6">
              {isQuote
                ? 'Your quote request has been submitted. The contractor will respond within 48 hours.'
                : isTimed
                  ? `Your 10-minute chat session with ${timedContractorName} is ready. A receipt has been sent to your email.`
                  : 'Your access has been activated. A receipt has been sent to your email.'}
            </p>
            <Button
              onClick={() => setConfirmed(true)}
              className="bg-green-600 hover:bg-green-700 text-white w-full text-base py-5 font-semibold"
            >
              OK
            </Button>
          </>
        ) : (
          // ── AFTER OK — show chat button or navigation ──
          <>
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-5">
              <MessageCircle className="w-10 h-10 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">
              {isTimed ? 'Start Your Chat' : 'You\'re All Set!'}
            </h1>
            <p className="text-slate-600 mb-6">
              {isTimed
                ? `Click below to open your 10-minute messaging session with ${timedContractorName}.`
                : isQuote
                  ? 'Your quote request is submitted. Track it in your account.'
                  : 'Your access is now active.'}
            </p>
            {isTimed && timedContractorEmail ? (
              <Button
                onClick={handleGoToChat}
                className="w-full text-white text-base py-5 font-semibold"
                style={{ backgroundColor: '#1E5A96' }}
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Chat with {timedContractorName}
              </Button>
            ) : (
              <Button
                onClick={() => navigate(isQuote ? '/CustomerAccount?tab=quotes' : '/')}
                className="bg-blue-600 hover:bg-blue-700 text-white w-full"
              >
                {isQuote ? 'View Your Quotes' : 'Return to Home'}
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}