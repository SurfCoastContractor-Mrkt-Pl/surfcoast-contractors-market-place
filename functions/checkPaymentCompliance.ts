import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const { contractor_email, message_text } = await req.json();

    if (!contractor_email) {
      return Response.json(
        { error: 'Missing contractor_email' },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Fetch contractor
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: contractor_email
    });

    if (!contractors || contractors.length === 0) {
      return Response.json(
        { success: true, should_flag: false },
        { status: 200 }
      );
    }

    const contractor = contractors[0];

    // Check if message contains payment keywords (off-platform payment red flags)
    const paymentKeywords = [
      'venmo', 'cashapp', 'cash app', 'paypal', 'wire transfer', 'direct deposit',
      'transfer', 'bank account', 'check payment', 'payment outside',
      'off platform', 'direct payment', 'separate payment', 'outside platform'
    ];

    const messageText = message_text?.toLowerCase() || '';
    const hasPaymentKeywords = paymentKeywords.some(keyword =>
      messageText.includes(keyword)
    );

    if (!hasPaymentKeywords) {
      return Response.json(
        { success: true, should_flag: false },
        { status: 200 }
      );
    }

    // Flag contractor for potential off-platform payment
    const gracePeriodDays = 14;
    const graceUntil = new Date();
    graceUntil.setDate(graceUntil.getDate() + gracePeriodDays);

    await base44.asServiceRole.entities.Contractor.update(contractor.id, {
      payment_compliant: false,
      last_external_payment_detected: new Date().toISOString(),
      payment_lock_grace_until: graceUntil.toISOString()
    });

    return Response.json({
      success: true,
      should_flag: true,
      message: `Account flagged for payment compliance review. You have until ${graceUntil.toLocaleDateString()} to process payment through SurfCoast.`
    });
  } catch (error) {
    console.error('Payment compliance check error:', error.message);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});