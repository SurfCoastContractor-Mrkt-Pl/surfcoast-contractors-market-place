import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);

  try {
    const body = await req.json();
    const { payment_id, contractor_id, contractor_name, contractor_email, customer_email, customer_name, work_description, job_id, job_title } = body;

    // Strict validation: all core fields required
    if (!payment_id || !contractor_id || !contractor_email || !customer_email || !work_description) {
      const missingFields = [];
      if (!payment_id) missingFields.push('payment_id');
      if (!contractor_id) missingFields.push('contractor_id');
      if (!contractor_email) missingFields.push('contractor_email');
      if (!customer_email) missingFields.push('customer_email');
      if (!work_description) missingFields.push('work_description');
      
      console.error('Missing required fields:', missingFields);
      return Response.json({ 
        error: 'Missing required fields', 
        missingFields 
      }, { status: 400 });
    }
    
    // Validate email formats
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contractor_email) || 
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer_email)) {
      return Response.json({ 
        error: 'Invalid email format' 
      }, { status: 400 });
    }
    
    // Validate work description is not just whitespace
    if (work_description.trim().length === 0) {
      return Response.json({ 
        error: 'Work description cannot be empty' 
      }, { status: 400 });
    }

    // Verify the payment exists, is confirmed, and belongs to this customer
    let payment;
    try {
      payment = await base44.asServiceRole.entities.Payment.get(payment_id);
    } catch (e) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }
    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }
    if (payment.status !== 'confirmed') {
      console.error('Payment not confirmed. Status:', payment.status, 'Payment ID:', payment_id);
      return Response.json({ error: 'Payment not confirmed' }, { status: 402 });
    }
    if (payment.payer_email.toLowerCase() !== customer_email.toLowerCase()) {
      console.error('Payment email mismatch. Expected:', customer_email, 'Got:', payment.payer_email);
      return Response.json({ error: 'Forbidden: Payment does not match customer email' }, { status: 403 });
    }

    // Verify contractor exists and is not locked
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ id: contractor_id });
    if (!contractors || contractors.length === 0) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }
    const contractor = contractors[0];
    if (contractor.account_locked || contractor.minor_hours_locked) {
      return Response.json({ error: 'Contractor is not available for quotes' }, { status: 403 });
    }

    // Idempotency: don't create duplicate
    const existing = await base44.asServiceRole.entities.QuoteRequest.filter({ payment_id });
    if (existing.length > 0) {
      return Response.json({ success: true, quote: existing[0], duplicate: true });
    }

    const quote = await base44.asServiceRole.entities.QuoteRequest.create({
      contractor_id,
      contractor_name,
      contractor_email,
      customer_email,
      customer_name,
      work_description,
      payment_id,
      ...(job_id ? { job_id } : {}),
      ...(job_title ? { job_title } : {}),
      status: 'pending',
      created_at: new Date().toISOString(),
      response_deadline: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
    });

    return Response.json({ success: true, quote });
  } catch (error) {
    console.error('createQuoteRequest error:', error.message);
    return Response.json({ error: 'Failed to create quote request' }, { status: 500 });
  }
});