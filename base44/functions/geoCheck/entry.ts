import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const US_COUNTRY_CODES = ['US'];

// Simple in-memory rate limiting (per IP, per minute)
const rateLimitMap = new Map();
const RATE_LIMIT_THRESHOLD = 10; // max 10 checks per minute per IP
const RATE_LIMIT_WINDOW = 60000; // 1 minute in milliseconds

function isRateLimited(ip) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
  if (!record || now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(ip, { count: 1, timestamp: now });
    return false;
  }
  
  record.count++;
  if (record.count > RATE_LIMIT_THRESHOLD) {
    console.warn(`[GEO-RATELIMIT] IP ${ip} exceeded rate limit (${record.count} requests in 1 min)`);
    return true;
  }
  return false;
}

Deno.serve(async (req) => {
  const clientIp = req.headers.get('cf-connecting-ip') || 
                   req.headers.get('x-forwarded-for') || 
                   'unknown';
  
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      console.warn(`[GEO] Invalid method: ${req.method} from IP: ${clientIp}`);
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // SECURITY: Rate limit to prevent brute-force/probing
    if (isRateLimited(clientIp)) {
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