import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// ─── HMAC request fingerprint helper ─────────────────────────────────────────
async function sha256(text) {
  const enc = new TextEncoder();
  const buf = await crypto.subtle.digest('SHA-256', enc.encode(text));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Forward event to central escalation pipeline ────────────────────────────
async function escalate(base44, event) {
  try {
    await base44.asServiceRole.functions.invoke('securityEscalate', event, {
      headers: { 'x-internal-service-key': Deno.env.get('INTERNAL_SERVICE_KEY') }
    });
  } catch (e) {
    console.error('escalate() failed:', e.message);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // ── Extract IP (Cloudflare-aware) ────────────────────────────────────────
    const ip =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = req.headers.get('user-agent') || '';
    const body = await req.json().catch(() => ({}));
    const path = body.path || '/';
    const userEmail = body.user_email || 'anonymous';

    // ── Request fingerprint (integrity marker stored in logs) ────────────────
    const fingerprint = await sha256(`${ip}|${userAgent}|${path}|${Date.now()}`);
    console.info(`GeoCheck fingerprint: ${fingerprint.substring(0, 16)}… IP: ${ip}`);

    // ── Allow local/private IPs (dev environments) ───────────────────────────
    if (ip === 'unknown' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
      return Response.json({ allowed: true, country: 'US', reason: 'local_ip' });
    }

    // ── Geo + proxy lookup ───────────────────────────────────────────────────
    let country = 'US';
    let countryName = 'United States';
    let isProxy = false;
    let isHosting = false;

    try {
      const geoRes = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,country,countryCode,proxy,hosting,query`,
        { signal: AbortSignal.timeout(3000) }
      );
      if (geoRes.ok) {
        const geo = await geoRes.json();
        if (geo.status === 'success') {
          country = geo.countryCode || 'US';
          countryName = geo.country || 'Unknown';
          isProxy = geo.proxy || false;
          isHosting = geo.hosting || false;
        }
      }
    } catch (geoError) {
      console.warn('Geo lookup failed:', geoError.message);
      return Response.json({ allowed: true, country: 'US', reason: 'geo_lookup_failed' });
    }

    const isUS = country === 'US';
    const blockedCountries = ['IL'];
    const isExplicitlyBlocked = blockedCountries.includes(country);

    // ─ Determine combined threat level ──────────────────────────────────────
    // Critical: foreign + proxy/VPN combo or explicitly blocked country
    // High:     non-US OR proxy/VPN alone
    const isForeignProxy = !isUS && (isProxy || isHosting);
    const severity = (isExplicitlyBlocked || isForeignProxy) ? 'critical'
      : (!isUS || isProxy || isHosting) ? 'high'
      : 'low';

    // ── Block: non-US or proxy/VPN/hosting ──────────────────────────────────
    if (!isUS || isProxy || isHosting) {
      const reason = isProxy || isHosting ? 'proxy_blocked' : 'geo_blocked';
      const details = [
        isExplicitlyBlocked ? `EXPLICITLY BLOCKED country: ${countryName} (${country}).` : '',
        !isUS ? `Non-US access from ${countryName} (${country}).` : '',
        isProxy ? 'Proxy/VPN detected.' : '',
        isHosting ? 'Hosting/Datacenter IP detected.' : '',
        `Request fingerprint: ${fingerprint.substring(0, 32)}`,
      ].filter(Boolean).join(' ');

      console.warn(`BLOCK [${severity}]: ${ip} — ${details}`);

      // Rate-limit to avoid alert flooding (max 5 per IP per hour)
      const recentAlerts = await base44.asServiceRole.entities.SecurityAlert.filter({
        ip_address: ip,
        created_date: { $gte: new Date(Date.now() - 3600000).toISOString() }
      }).catch(() => []);

      if (!recentAlerts || recentAlerts.length < 5) {
        // Route through central escalation pipeline
        await escalate(base44, {
          alert_type: reason,
          severity,
          ip_address: ip,
          country,
          country_name: countryName,
          is_proxy: isProxy,
          is_hosting: isHosting,
          user_agent: userAgent,
          path,
          user_email: userEmail,
          details,
        });
      }

      return Response.json({ allowed: false, country, countryName, reason });
    }

    // ── Allowed (US, no proxy) ───────────────────────────────────────────────
    return Response.json({ allowed: true, country, countryName });

  } catch (error) {
    console.error('geoCheck fatal error:', error.message);
    // Fail open — don't block users if geo check crashes
    return Response.json({ allowed: true, country: 'US', reason: 'error_fallback' });
  }
});