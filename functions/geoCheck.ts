import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get IP from headers (Cloudflare/proxy-aware)
    const ip =
      req.headers.get('cf-connecting-ip') ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    const userAgent = req.headers.get('user-agent') || '';
    const body = await req.json().catch(() => ({}));
    const path = body.path || '/';

    // Use ip-api.com (free, no key needed, 45 req/min)
    let country = 'US';
    let countryName = 'United States';
    let isProxy = false;
    let isTor = false;
    let isHosting = false;

    if (ip !== 'unknown' && ip !== '127.0.0.1' && !ip.startsWith('192.168.') && !ip.startsWith('10.')) {
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
        // Default to allowing if lookup fails — don't block on lookup errors
        return Response.json({ allowed: true, country: 'US', reason: 'geo_lookup_failed' });
      }
    } else {
      // Local/private IP — allow (dev environment)
      return Response.json({ allowed: true, country: 'US', reason: 'local_ip' });
    }

    const isUS = country === 'US';
    const blockedCountries = ['IL']; // Israel
    const isBlocked = blockedCountries.includes(country);

    // Log geo block
    if (!isUS || isBlocked) {
      console.warn(`GEO BLOCK: ${ip} from ${countryName} (${country}) tried to access ${path}`);
      
      try {
        // SECURITY: Rate-limit security alerts per IP to prevent alert flooding
        const rateKey = `geo_block_${ip}`;
        const existingAlerts = await base44.asServiceRole.entities.SecurityAlert.filter({
          ip_address: ip,
          alert_type: 'geo_block',
          created_date: { $gte: new Date(Date.now() - 3600000).toISOString() } // Last 1 hour
        });
        
        if (!existingAlerts || existingAlerts.length < 5) {
          await base44.asServiceRole.entities.SecurityAlert.create({
            alert_type: 'geo_block',
            severity: isBlocked ? 'high' : 'medium',
            ip_address: ip,
            country: country,
            country_name: countryName,
            user_agent: userAgent.substring(0, 300),
            path: path,
            details: isBlocked ? `Blocked country access from ${countryName} (${country}). Proxy: ${isProxy}, Hosting: ${isHosting}` : `Non-US access attempt from ${countryName} (${country}). Proxy: ${isProxy}, Hosting: ${isHosting}`,
          });

          // Send admin email alert for geo blocks (only if under limit)
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: Deno.env.get('ADMIN_ALERT_EMAIL'),
            from_name: 'SurfCoast Security',
            subject: `[SECURITY] Geo Block — ${countryName} (${country})`,
            body: `A non-US access attempt was blocked.\n\nIP: ${ip}\nCountry: ${countryName} (${country})\nProxy/VPN: ${isProxy}\nHosting/Datacenter: ${isHosting}\nPath: ${path}\nUser Agent: ${userAgent}\nTime: ${new Date().toISOString()}\n\nThis is an automated security alert from SurfCoast Contractor Market Place.`,
          });
        }
      } catch (logErr) {
        console.error('Failed to log geo block:', logErr.message);
      }

      return Response.json({ allowed: false, country, countryName, reason: 'geo_blocked' });
    }

    // Block proxy/VPN/hosting IPs — these are used to bypass geo-restrictions
    if (isProxy || isHosting) {
      console.warn(`PROXY/VPN BLOCK: ${ip} from ${countryName} (${country}) using proxy/hosting. Path: ${path}`);

      try {
        const recentProxyAlerts = await base44.asServiceRole.entities.SecurityAlert.filter({
          ip_address: ip,
          alert_type: 'proxy_block',
          created_date: { $gte: new Date(Date.now() - 3600000).toISOString() }
        });

        if (!recentProxyAlerts || recentProxyAlerts.length < 3) {
          await base44.asServiceRole.entities.SecurityAlert.create({
            alert_type: 'proxy_block',
            severity: 'high',
            ip_address: ip,
            country: country,
            country_name: countryName,
            user_agent: userAgent.substring(0, 300),
            path: path,
            details: `Proxy/VPN/Hosting provider blocked. Country: ${countryName} (${country}). Proxy: ${isProxy}, Hosting: ${isHosting}`,
          });

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: Deno.env.get('ADMIN_ALERT_EMAIL'),
            from_name: 'SurfCoast Security',
            subject: `[SECURITY ALERT] Proxy/VPN Access Blocked`,
            body: `A proxy/VPN or hosting provider IP was blocked from accessing the platform.\n\nIP: ${ip}\nCountry: ${countryName} (${country})\nProxy: ${isProxy}\nHosting/Datacenter: ${isHosting}\nPath: ${path}\nUser Agent: ${userAgent}\nTime: ${new Date().toISOString()}\n\nThis IP has been denied access.\n\nSurfCoast Security System`,
          });
        }
      } catch (logErr) {
        console.error('Failed to log proxy block:', logErr.message);
      }

      return Response.json({ allowed: false, country, countryName, reason: 'proxy_blocked' });
    }

    return Response.json({ allowed: true, country, countryName });
  } catch (error) {
    console.error('geoCheck error');
    // Fail open — don't block users if our check crashes
    return Response.json({ allowed: true, country: 'US', reason: 'error_fallback' });
  }
});