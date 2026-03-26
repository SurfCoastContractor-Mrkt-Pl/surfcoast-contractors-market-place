import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PAYMENT_KEYWORDS = [
  'venmo',
  'paypal',
  'cash',
  'zelle',
  'wire transfer',
  'bank transfer',
  'crypto',
  'bitcoin',
  'check',
  'ach',
  'direct deposit',
  'off platform',
  'outside surfcoast',
  'private payment',
  'under the table',
  'direct payment',
  'personal account',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // SECURITY: Only service role or admins can trigger this function
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      console.warn(`[AUTH_VIOLATION] Non-admin user ${user.email} attempted to call detectOffPlatformPayment`);
      return Response.json(
        { error: 'Forbidden: Only admins or automated systems can scan for payment compliance' },
        { status: 403 }
      );
    }
    
    const { message_id, sender_email, body } = await req.json();

    if (!message_id || !sender_email || !body) {
      return Response.json(
        { error: 'Missing required fields: message_id, sender_email, body' },
        { status: 400 }
      );
    }

    const lowerBody = body.toLowerCase();
    const foundKeywords = PAYMENT_KEYWORDS.filter(keyword =>
      lowerBody.includes(keyword)
    );

    if (foundKeywords.length === 0) {
      return Response.json({ detected: false, keywords: [] });
    }

    // Found payment keywords - update contractor's compliance status
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: sender_email,
    });

    if (contractors && contractors.length > 0) {
      const contractor = contractors[0];
      await base44.asServiceRole.entities.Contractor.update(contractor.id, {
        payment_compliant: false,
        last_external_payment_detected: new Date().toISOString(),
        payment_lock_grace_until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      });

      console.log(
        `[PAYMENT_COMPLIANCE] Contractor ${contractor.id} (${sender_email}) flagged. Keywords: ${foundKeywords.join(', ')}`
      );
    }

    return Response.json({
      detected: true,
      keywords: foundKeywords,
      contractor_id: contractors?.[0]?.id,
      action: 'flagged_non_compliant',
    });
  } catch (error) {
    console.error('[PAYMENT_COMPLIANCE_ERROR]', error.message);
    return Response.json(
      { error: 'Failed to process message scan', details: error.message },
      { status: 500 }
    );
  }
});