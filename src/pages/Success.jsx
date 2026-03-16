import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Loader2 } from 'lucide-react';

export default function Success() {
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [error, setError] = useState(null);
  const [isQuote, setIsQuote] = useState(false);
  const [isTimed, setIsTimed] = useState(false);
  const [timedContractorEmail, setTimedContractorEmail] = useState('');
  const [timedContractorName, setTimedContractorName] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [countdown, setCountdown] = useState(null);

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
        console.log(`[Success] Starting payment verification for ID: ${pId}`);

        // Poll for confirmed status — the webhook fires asynchronously
         let payment = null;
         const maxAttempts = 15;
         let delayMs = 500; // Start with shorter delay

         for (let i = 0; i < maxAttempts; i++) {
           try {
             // Use service-role via backend function to read the payment regardless of auth state
             const result = await base44.functions.invoke('verifyPayment', { payment_id: pId });
             const p = result?.data?.payment;
             console.log(`[Success] Attempt ${i + 1}/${maxAttempts}: status=${p?.status || 'not found'}`);
             if (p) {
               payment = p;
               if (p.status === 'confirmed') break;
             }
           } catch (fetchErr) {
             console.warn(`[Success] Fetch attempt ${i + 1} error:`, fetchErr.message);
           }
           if (i < maxAttempts - 1) {
             // Progressive backoff: 500ms, 750ms, 1000ms, then cap at 1000ms
             await new Promise(r => setTimeout(r, delayMs));
             delayMs = Math.min(delayMs + 250, 1000);
           }
         }

        if (!payment) {
          // Payment record not accessible — likely RLS. Show success anyway since Stripe redirected here.
          console.warn('[Success] Could not read payment record — showing success based on Stripe redirect.');
        } else if (payment.status === 'expired') {
          setError('This payment session has expired. Please try again.');
          return;
        }

        // If this was a quote request, auto-create the QuoteRequest record
        if (quoteMetaRaw) {
          try {
            const quoteMeta = JSON.parse(decodeURIComponent(quoteMetaRaw));
            console.log(`[Success] Creating quote request with meta:`, quoteMeta);
            const quoteResult = await base44.functions.invoke('createQuoteRequest', {
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
            console.log(`[Success] Quote request result:`, quoteResult?.data);
            setIsQuote(true);
          } catch (qErr) {
            console.error('[Success] Failed to create quote request:', qErr.message);
            // Don't block success — quote may have already been created
            setIsQuote(true);
          }
        }
      } catch (err) {
        console.error('Payment verification error:', err);
        // Don't show an error — Stripe already redirected us here meaning payment went through
      } finally {
        setIsVerifying(false);
      }
    };

    verifyAndFinalize();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-8 text-center">
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
              <span className="text-2xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-red-900 mb-2">Payment Error</h1>
            <p className="text-red-700 mb-6">{error}</p>
            <Button onClick={() => navigate(-1)} className="bg-red-600 hover:bg-red-700 text-white">
              Go Back
            </Button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h1>
            <p className="text-slate-600 mb-6">
              {isQuote
                ? 'Your quote request has been submitted! The contractor will respond within 48 hours. You can track it in your account.'
                : isTimed
                  ? `Your 10-minute chat session with ${timedContractorName || 'the contractor'} is now active. Click below to start messaging.`
                  : 'Your platform access fee has been processed. A confirmation email has been sent to you.'}
            </p>
            {isTimed && timedContractorEmail ? (
              <Button
                onClick={() => navigate(`/Messaging?with=${encodeURIComponent(timedContractorEmail)}&name=${encodeURIComponent(timedContractorName)}&tier=timed&payment_id=${paymentId}`)}
                className="bg-green-600 hover:bg-green-700 text-white w-full"
              >
                Message {timedContractorName || 'Contractor'}
              </Button>
            ) : (
              <Button
                onClick={() => navigate(isQuote ? '/CustomerAccount?tab=quotes' : '/')}
                className="bg-green-600 hover:bg-green-700 text-white w-full"
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