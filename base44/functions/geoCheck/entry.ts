import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

const US_COUNTRY_CODES = ['US'];

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

    // Get IP-based country from Cloudflare headers (available on Deno Deploy)
    const cfCountry = req.headers.get('cf-ipcountry') || 
                      req.headers.get('x-vercel-ip-country') ||
                      req.headers.get('x-country-code');

    // SECURITY: Fail closed — block if country header is missing
    if (!cfCountry) {
      console.warn(`[GEO-BLOCK] Missing country header from IP: ${clientIp}. Possible VPN/proxy or misconfigured CDN.`);
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