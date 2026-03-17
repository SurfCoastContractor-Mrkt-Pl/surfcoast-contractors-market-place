import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Service-role payment lookup — used by the Success page to verify a payment
// regardless of whether the user is logged in (customers may be guests).
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { payment_id } = await req.json();

    if (!payment_id) {
      return Response.json({ error: 'payment_id required' }, { status: 400 });
    }

    let payment;
    try {
      payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    } catch (lookupErr) {
      console.warn('Payment lookup failed:', lookupErr.message);
      return Response.json({ payment: null });
    }

    if (!payment) {
      return Response.json({ payment: null });
    }

    return Response.json({
      payment: {
        id: payment.id,
        status: payment.status,
        payer_type: payment.payer_type,
        amount: payment.amount,
        purpose: payment.purpose,
        confirmed_at: payment.confirmed_at,
        created_date: payment.created_date,
      }
    });
  } catch (error) {
    console.error('verifyPayment error:', error.message);
    return Response.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
});