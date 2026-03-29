import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const US_COUNTRY_CODES = ['US'];
const RATE_LIMIT_THRESHOLD = 10; // max 10 checks per minute per IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

async function isRateLimited(base44, ip) {
  try {
    const now = new Date().toISOString();
    const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW).toISOString();

    // Check for existing rate limit record
    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `geo_check:${ip}`,
      window_start: { $gte: windowStart }
    });

    if (records && records.length > 0) {
      const record = records[0];
      if (record.request_count >= RATE_LIMIT_THRESHOLD) {
        console.warn(`[GEO-RATELIMIT] IP ${ip} exceeded rate limit (${record.request_count} requests)`);
        return true;
      }
      // Increment counter
      await base44.asServiceRole.entities.RateLimitTracker.update(record.id, {
        request_count: record.request_count + 1
      });
    } else {
      // Create new rate limit record
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: `geo_check:${ip}`,
        limit_type: 'geo_check',
        request_count: 1,
        window_start: now,
        window_duration_seconds: Math.floor(RATE_LIMIT_WINDOW / 1000)
      });
    }
    return false;
  } catch (error) {
    console.error('[GEO-RATELIMIT-ERROR]', error.message);
    // Fail open on rate limit check errors
    return false;
  }
}

async function logSecurityAlert(eventType, clientIp, details) {
  try {
    const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.23');
    // Create a minimal request object for SDK initialization
    const base44 = createClientFromRequest(new Request('http://localhost', { method: 'POST' }));
    
    await base44.asServiceRole.entities.SecurityAlert.create({
      event_type: eventType,
      client_ip: clientIp,
      severity: details.severity || 'medium',
      country_code: details.countryCode,
      country_name: details.countryName,
      is_vpn: details.isVpn || false,
      http_method: details.method,
      user_agent: details.userAgent,
      request_path: details.path,
      notes: details.notes,
      timestamp: new Date().toISOString()
    });
  } catch (logError) {
    console.error('[SECURITY-LOG-ERROR]', logError.message);
  }
}

Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
                   'unknown';
  const userAgent = req.headers.get('user-agent') || 'unknown';
  const path = new URL(req.url).pathname;
  
  try {
    // Allow GET and POST requests (some clients may use POST)
    if (req.method !== 'GET' && req.method !== 'POST') {
      console.warn(`[GEO] Invalid method: ${req.method} from IP: ${clientIp}`);
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // Initialize Base44 client for rate limiting checks
    const base44 = createClientFromRequest(req);

    // SECURITY: Rate limit to prevent brute-force/probing (database-backed)
    if (await isRateLimited(base44, clientIp)) {
      logSecurityAlert('rate_limited', clientIp, {
        severity: 'high',
        method: req.method,
        userAgent,
        path,
        notes: 'Exceeded rate limit threshold'
      });
      return Response.json({ 
        allowed: false, 
        country: 'RATE_LIMITED', 
        countryName: 'Rate Limited',
        reason: 'Too many requests' 
      }, { status: 429 });
    }

    // Get IP-based country from Cloudflare headers (available on Deno Deploy)
    const cfCountry = req.headers.get('cf-ipcountry') || 
                      req.headers.get('x-vercel-ip-country') ||
                      req.headers.get('x-country-code');

    // SECURITY: Fail closed — block if country header is missing
    if (!cfCountry) {
      logSecurityAlert('missing_headers', clientIp, {
        severity: 'medium',
        method: req.method,
        userAgent,
        path,
        notes: 'Missing CDN country header'
      });
      console.warn(`[GEO-BLOCK] Missing country header from IP: ${clientIp}. Possible VPN/proxy or misconfigured CDN.`);
      
      // Secondary check: Query IPinfo.io free API for VPN/proxy detection
      try {
        const ipinfoRes = await fetch(`https://ipinfo.io/${clientIp}/json`);
        if (ipinfoRes.ok) {
          const ipinfoData = await ipinfoRes.json();
          if (ipinfoData.bogon === true || ipinfoData.privacy?.vpn === true || ipinfoData.privacy?.proxy === true) {
            console.warn(`[GEO-BLOCK] VPN/Proxy detected via IPinfo for IP: ${clientIp}`);
            return Response.json({ 
              allowed: false, 
              country: 'VPN_DETECTED', 
              countryName: 'VPN/Proxy Blocked',
              reason: 'VPN or proxy service detected' 
            });
          }
        }
      } catch (e) {
        console.debug(`[GEO] IPinfo lookup failed (non-critical):`, e.message);
      }

      return Response.json({ 
        allowed: false, 
        country: 'UNKNOWN', 
        countryName: 'Unknown/Blocked',
        reason: 'Country detection unavailable' 
      });
    }

    const country = cfCountry.toUpperCase().trim();
    
    // Validate country code format (must be 2-letter ISO code)
    if (!/^[A-Z]{2}$/.test(country)) {
      console.warn(`[GEO-BLOCK] Invalid country code format: "${country}" from IP: ${clientIp}`);
      return Response.json({ 
        allowed: false, 
        country: 'INVALID', 
        countryName: 'Invalid Country Code',
        reason: 'Invalid country code format' 
      });
    }

    // SECURITY: Block 'XX' (unknown location) — likely VPN/proxy or datacenter IP
    if (country === 'XX') {
      console.warn(`[GEO-BLOCK] Unknown location (XX) from IP: ${clientIp}. Possible VPN/proxy/datacenter.`);
      
      // Verify with IPinfo
      try {
        const ipinfoRes = await fetch(`https://ipinfo.io/${clientIp}/json`);
        if (ipinfoRes.ok) {
          const ipinfoData = await ipinfoRes.json();
          if (ipinfoData.country && ipinfoData.country !== 'US') {
            return Response.json({ 
              allowed: false, 
              country: ipinfoData.country, 
              countryName: ipinfoData.country_name || ipinfoData.country,
              reason: 'Non-US location' 
            });
          }
          if (ipinfoData.privacy?.vpn === true || ipinfoData.privacy?.proxy === true) {
            logSecurityAlert('vpn_detected', clientIp, {
              severity: 'high',
              countryCode: 'XX',
              countryName: 'VPN/Proxy',
              method: req.method,
              userAgent,
              path,
              isVpn: true,
              notes: 'VPN/proxy confirmed via IPinfo'
            });
            console.warn(`[GEO-BLOCK] VPN/Proxy confirmed for XX country from IP: ${clientIp}`);
            return Response.json({ 
              allowed: false, 
              country: 'XX', 
              countryName: 'VPN/Proxy Detected',
              reason: 'VPN or proxy service detected' 
            });
          }
        }
      } catch (e) {
        console.debug(`[GEO] IPinfo lookup failed for XX:`, e.message);
      }

      return Response.json({ 
        allowed: false, 
        country: 'XX', 
        countryName: 'Unknown Location',
        reason: 'Unknown location detected' 
      });
    }

    const allowed = US_COUNTRY_CODES.includes(country);

    if (!allowed) {
      logSecurityAlert('geo_blocked', clientIp, {
        severity: 'low',
        countryCode: country,
        countryName,
        method: req.method,
        userAgent,
        path,
        notes: `Non-US access attempt from ${country}`
      });
      console.warn(`[GEO-BLOCK] Non-US access from ${country} (IP: ${clientIp})`);
    } else {
      console.info(`[GEO-ALLOW] US access from ${country} (IP: ${clientIp})`);
    }

    // Map country code to name for display
    const countryNames = {
      GB: 'United Kingdom', CA: 'Canada', AU: 'Australia', DE: 'Germany',
      FR: 'France', MX: 'Mexico', JP: 'Japan', CN: 'China', IN: 'India',
      BR: 'Brazil', ZA: 'South Africa', NG: 'Nigeria', KE: 'Kenya',
    };
    const countryName = country === 'US' ? 'United States' : (countryNames[country] || country);

    return Response.json({ allowed, country, countryName });
  } catch (error) {
  logSecurityAlert('suspicious_activity', clientIp, {
    severity: 'high',
    method: req.method,
    userAgent,
    path,
    notes: `Geo-check error: ${error.message}`
  });
  console.error(`[GEO-ERROR] Unexpected error from IP: ${clientIp}`, error);
  // SECURITY: Fail closed — block access if geo check fails (don't allow errors to bypass)
  return Response.json({ 
    allowed: false, 
    country: 'ERROR', 
    countryName: 'System Error',
    reason: 'Geo-check failed' 
  });
  }
});