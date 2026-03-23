import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authentication — only authenticated users (sending messages) or internal service calls
    const internalKey = req.headers.get('x-internal-service-key');
    const isValidInternalCall = internalKey && internalKey === Deno.env.get('INTERNAL_SERVICE_KEY');

    if (!isValidInternalCall) {
      const user = await base44.auth.me().catch(() => null);
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { contractor_email, message_text } = await req.json();

    if (!contractor_email) {
      return Response.json(
        { error: 'Missing contractor_email' },
        { status: 400 }
      );
    }

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
    // Use word boundaries to avoid false positives (e.g., "transfer files" ≠ "wire transfer")
    const paymentPatterns = [
      /\bvenmo\b/i,
      /\bcash\s?app\b/i,
      /\bpaypal\b/i,
      /\bwire\s+transfer\b/i,
      /\bdirect\s+deposit\b/i,
      /\bbank\s+account\b/i,
      /\bcheck\s+payment\b/i,
      /\bpayment\s+outside\b/i,
      /\boff\s+platform\b/i,
      /\bdirect\s+payment\b/i,
      /\bseparate\s+payment\b/i,
      /\boutside\s+platform\b/i
    ];

    const messageText = message_text?.toLowerCase() || '';
    const hasPaymentKeywords = paymentPatterns.some(pattern =>
      pattern.test(messageText)
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