/**
 * Create Payment with Idempotency Key
 * Prevents duplicate charges if webhook retried or request replayed
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { payer_email, payer_name, payer_type, amount, contractor_email, idempotency_key } = await req.json();

    // Validate idempotency key
    if (!idempotency_key) {
      return Response.json({ error: 'idempotency_key required' }, { status: 400 });
    }

    // Check if payment with this idempotency key already exists
    const existing = await base44.entities.Payment.filter({
      idempotency_key: idempotency_key
    });

    if (existing.length > 0) {
      console.log(`Payment already exists for idempotency_key: ${idempotency_key}`);
      return Response.json({ 
        payment: existing[0],
        duplicate: true,
        message: 'Duplicate request detected - returning existing payment'
      });
    }

    // Create new payment with idempotency key
    const payment = await base44.entities.Payment.create({
      payer_email,
      payer_name,
      payer_type,
      amount,
      contractor_email,
      idempotency_key,
      status: 'pending'
    });

    console.log(`Payment created: ${payment.id}, idempotency_key: ${idempotency_key}`);

    return Response.json({ 
      payment,
      duplicate: false,
      message: 'Payment created successfully'
    });
  } catch (error) {
    console.error('createPaymentWithIdempotency error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});