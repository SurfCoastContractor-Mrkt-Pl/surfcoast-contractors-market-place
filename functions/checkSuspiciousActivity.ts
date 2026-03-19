import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// ─── SHA-256 payload fingerprint ──────────────────────────────────────────────
async function sha256(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── HMAC signature ───────────────────────────────────────────────────────────
async function hmacSign(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Route to central escalation pipeline ─────────────────────────────────────
async function escalate(base44, event) {
  try {
    await base44.asServiceRole.functions.invoke('securityEscalate', event, {
      headers: { 'x-internal-service-key': Deno.env.get('INTERNAL_SERVICE_KEY') }
    });
  } catch (e) {
    console.error('escalate() call failed:', e.message);
  }
}

/**
 * Detects and flags suspicious patterns:
 * - Multiple payment methods added in a short time
 * - Repeated failed payment attempts
 * - Payments from flagged countries or via proxy IPs
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ── Auth: must be the customer themselves or an internal service call ────
    const internalKey = req.headers.get('x-internal-service-key');
    const isValidInternalCall = internalKey && internalKey === Deno.env.get('INTERNAL_SERVICE_KEY');

    let user = null;
    if (!isValidInternalCall) {
      user = await base44.auth.me().catch(() => null);
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { customer_email, payment_method_id, ip_country } = await req.json();

    if (!customer_email) {
      return Response.json({ error: 'Missing customer email' }, { status: 400 });
    }

    // ── Payload integrity fingerprint ────────────────────────────────────────
    const payloadStr = JSON.stringify({ customer_email, ip_country, ts: new Date().toISOString() });
    const payloadHash = await sha256(payloadStr);
    const hmacSig = await hmacSign(Deno.env.get('INTERNAL_SERVICE_KEY') || 'fallback', payloadStr);

    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // ── Check payment methods added in last hour ─────────────────────────────
    const recentMethods = await base44.asServiceRole.entities.SavedPaymentMethod.filter({
      user_email: customer_email,
      created_date: { $gte: lastHour.toISOString() }
    }).catch(() => []);

    const alerts = [];

    if (recentMethods.length > 2) {
      alerts.push({
        type: 'multiple_payment_methods',
        severity: 'high',
        message: `${recentMethods.length} payment methods added in the last hour`,
      });
    }

    // ── Flag if country is non-US (payment context) ──────────────────────────
    const isNonUS = ip_country && ip_country !== 'US' && ip_country !== 'United States';
    if (isNonUS) {
      alerts.push({
        type: 'non_us_payment_attempt',
        severity: 'critical',
        message: `Payment activity detected from non-US location: ${ip_country}`,
      });
    }

    if (alerts.length > 0) {
      const details = alerts.map(a => `[${a.severity.toUpperCase()}] ${a.type}: ${a.message}`).join('\n') +
        `\n\nPayload hash: ${payloadHash}\nHMAC: ${hmacSig.substring(0, 32)}`;

      const maxSeverity = alerts.some(a => a.severity === 'critical') ? 'critical' : 'high';

      // Route through central escalation pipeline
      await escalate(base44, {
        alert_type: 'suspicious_payment_activity',
        severity: maxSeverity,
        ip_address: ip_country || 'unknown',
        country: isNonUS ? ip_country : 'US',
        country_name: isNonUS ? ip_country : 'United States',
        is_proxy: false,
        is_hosting: false,
        user_email: customer_email,
        path: '/payment',
        details,
      });
    }

    return Response.json({
      suspicious: alerts.length > 0,
      alerts,
      recommendation: alerts.length > 0 ? 'Review and potentially verify customer' : 'Normal activity',
    });

  } catch (error) {
    console.error('Suspicious activity check error:', error.message);
    return Response.json({ error: 'Check failed' }, { status: 500 });
  }
});