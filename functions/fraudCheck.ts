import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Fraud detection checks for payments
 * - Rate limiting: max 10 payments per hour per customer
 * - Velocity check: max 3 payments to same contractor per day
 * - Amount limits: max $5000 per transaction, $10k per day per contractor
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Validate internal key for service-to-service calls
    const providedKey = req.headers.get('x-internal-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    
    const isValidInternalCall = providedKey && expectedKey && providedKey === expectedKey;
    if (!isValidInternalCall) {
      console.warn('Unauthorized fraud check attempt - invalid or missing internal key');
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { customer_email, contractor_id, amount } = await req.json();

    if (!customer_email || !contractor_id || !amount) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. RATE LIMIT CHECK: Max 10 payments per hour per customer
    const recentPayments = await base44.asServiceRole.entities.Payment.filter({
      payer_email: customer_email,
      created_date: { $gte: oneHourAgo.toISOString() }
    });

    if (recentPayments.length >= 10) {
      return Response.json(
        {
          fraud_detected: true,
          reason: 'rate_limit_exceeded',
          message: 'Too many payments in short time. Please try again in 1 hour.'
        },
        { status: 429 }
      );
    }

    // 2. VELOCITY CHECK: Max 3 payments to same contractor per day
    const velocityPayments = await base44.asServiceRole.entities.Payment.filter({
      payer_email: customer_email,
      contractor_id: contractor_id,
      created_date: { $gte: oneDayAgo.toISOString() }
    });

    if (velocityPayments.length >= 3) {
      return Response.json(
        {
          fraud_detected: true,
          reason: 'velocity_limit_exceeded',
          message: 'Multiple payments to this contractor today. Contact support if needed.'
        },
        { status: 429 }
      );
    }

    // 3. AMOUNT LIMIT CHECK: Max $5000 per transaction
    if (amount > 5000) {
      return Response.json(
        {
          fraud_detected: true,
          reason: 'amount_exceeds_limit',
          message: 'Payment amount exceeds $5,000 limit. Contact support for large payments.'
        },
        { status: 400 }
      );
    }

    // 4. DAILY AMOUNT LIMIT: Max $10k per contractor per day
    const dailyTotal = velocityPayments.reduce((sum, p) => sum + p.amount, 0) + amount;
    if (dailyTotal > 10000) {
      return Response.json(
        {
          fraud_detected: true,
          reason: 'daily_limit_exceeded',
          message: `Daily payment limit to this contractor is $10,000. Remaining today: $${(10000 - (dailyTotal - amount)).toFixed(2)}`
        },
        { status: 400 }
      );
    }

    // All checks passed
    return Response.json({
      fraud_detected: false,
      checks_passed: [
        'rate_limit_ok',
        'velocity_check_ok',
        'amount_limit_ok',
        'daily_limit_ok'
      ],
      summary: {
        payments_this_hour: recentPayments.length,
        payments_to_contractor_today: velocityPayments.length,
        daily_total_to_contractor: dailyTotal.toFixed(2)
      }
    });
  } catch (error) {
    console.error('Fraud check error');
    return Response.json(
      { error: 'Fraud check failed' },
      { status: 500 }
    );
  }
});