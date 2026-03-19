/**
 * securityEscalate — Central security escalation function.
 *
 * Responsibilities:
 *  1. Accepts a structured security event from any backend function or internal trigger.
 *  2. Computes a SHA-256 HMAC payload signature for tamper-proof audit logging.
 *  3. Persists the event to SecurityAlert with full forensic metadata.
 *  4. Sends tiered alerts:
 *     - severity=high   → Admin alert email
 *     - severity=critical → Admin email + Base44 security contact
 *  5. Handles automatic escalation for out-of-US access, proxy/VPN abuse,
 *     brute-force patterns, and suspected platform breach.
 *
 * Called internally via x-internal-service-key. Never exposed to end users.
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// ─── HMAC helpers ────────────────────────────────────────────────────────────
async function hmacSign(secret, payload) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function sha256(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Alert copy ──────────────────────────────────────────────────────────────
function buildAlertBody(event) {
  return `
════════════════════════════════════════
 SURFCOAST SECURITY ALERT
════════════════════════════════════════

Severity   : ${event.severity?.toUpperCase()}
Event Type : ${event.alert_type}
Time (UTC) : ${new Date().toISOString()}

── Source ──────────────────────────────
IP Address  : ${event.ip_address || 'unknown'}
Country     : ${event.country_name || 'unknown'} (${event.country || '?'})
Proxy/VPN   : ${event.is_proxy ? 'YES ⚠️' : 'no'}
Hosting IP  : ${event.is_hosting ? 'YES ⚠️' : 'no'}
User Agent  : ${event.user_agent || 'unknown'}

── Details ─────────────────────────────
${event.details || 'No additional details'}

── Integrity ───────────────────────────
Payload Hash : ${event.payload_hash || 'n/a'}
HMAC Sig     : ${event.hmac_signature || 'n/a'}

── Impacted User ───────────────────────
Email : ${event.user_email || 'anonymous'}
Path  : ${event.path || '/'}

════════════════════════════════════════
Review in Admin Dashboard → Security Alerts
SurfCoast Automated Security System
  `.trim();
}

// ─── Main handler ────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    // Only accept internal service calls
    const internalKey = req.headers.get('x-internal-service-key');
    if (!internalKey || internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const base44 = createClientFromRequest(req);
    const event = await req.json();

    const {
      alert_type,
      severity = 'medium',
      ip_address,
      country,
      country_name,
      is_proxy = false,
      is_hosting = false,
      user_agent,
      path,
      details,
      user_email,
    } = event;

    if (!alert_type) {
      return Response.json({ error: 'alert_type is required' }, { status: 400 });
    }

    // ── Compute integrity fingerprints ──────────────────────────────────────
    const payloadString = JSON.stringify({ alert_type, severity, ip_address, country, details, user_email, ts: new Date().toISOString() });
    const payloadHash = await sha256(payloadString);
    const hmacSig = await hmacSign(Deno.env.get('INTERNAL_SERVICE_KEY') || 'fallback', payloadString);

    // ── Persist to SecurityAlert ────────────────────────────────────────────
    let alertRecord;
    try {
      alertRecord = await base44.asServiceRole.entities.SecurityAlert.create({
        alert_type,
        severity,
        ip_address: ip_address || 'unknown',
        country: country || 'XX',
        country_name: country_name || 'Unknown',
        user_agent: (user_agent || '').substring(0, 400),
        path: path || '/',
        details: (details || '') + `\n\n[Payload Hash: ${payloadHash}]`,
        user_email: user_email || 'anonymous',
        is_proxy,
        is_hosting,
        payload_hash: payloadHash,
        hmac_signature: hmacSig.substring(0, 64), // store first 32 bytes
      });
    } catch (dbErr) {
      console.error('SecurityAlert DB write failed:', dbErr.message);
    }

    const enrichedEvent = { ...event, payload_hash: payloadHash, hmac_signature: hmacSig };
    const alertBody = buildAlertBody(enrichedEvent);
    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');

    // ── Severity: high → notify admin ───────────────────────────────────────
    if (severity === 'high' || severity === 'critical') {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: adminEmail,
          from_name: 'SurfCoast Security System',
          subject: `🚨 [${severity.toUpperCase()}] Security Alert — ${alert_type} from ${country_name || country || 'Unknown'}`,
          body: alertBody,
        });
      } catch (emailErr) {
        console.error('Admin alert email failed:', emailErr.message);
      }
    }

    // ── Severity: critical → also escalate to Base44 IT security ───────────
    if (severity === 'critical') {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: 'security@base44.com',
          from_name: 'SurfCoast Security — Automated Escalation',
          subject: `🔴 [CRITICAL BREACH ESCALATION] SurfCoast — ${alert_type}`,
          body: `This is an automated critical security escalation from SurfCoast Contractor Marketplace (Base44 app).\n\nA CRITICAL security event has been detected and requires immediate platform-level review.\n\n${alertBody}\n\n---\nApp: SurfCoast Contractor Marketplace\nEscalation ID: ${alertRecord?.id || 'unknown'}\nThis message was generated automatically by the SurfCoast security pipeline.`,
        });
      } catch (b44Err) {
        console.error('Base44 escalation email failed:', b44Err.message);
      }
    }

    return Response.json({
      success: true,
      alert_id: alertRecord?.id,
      payload_hash: payloadHash,
      escalated: severity === 'critical',
    });

  } catch (err) {
    console.error('securityEscalate fatal error:', err.message);
    return Response.json({ error: 'Escalation failed' }, { status: 500 });
  }
});