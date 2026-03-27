import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
const RATE_LIMIT_DELAY_MS = 1000; // 1 second between requests

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function geocodeWithNominatim(address, base44) {
  // Database-backed rate limiting (1 second between requests per user)
  try {
    const userEmail = (await base44.auth.me())?.email || 'anonymous';
    const now = new Date().toISOString();
    const windowStart = new Date(Date.now() - 2000).toISOString(); // 2 second window for safety

    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `geocode:${userEmail}`,
      window_start: { $gte: windowStart }
    });

    if (records && records.length > 0) {
      const lastRequest = new Date(records[0].window_start).getTime();
      const elapsed = Date.now() - lastRequest;
      if (elapsed < RATE_LIMIT_DELAY_MS) {
        await sleep(RATE_LIMIT_DELAY_MS - elapsed);
      }
    }

    // Record this request
    await base44.asServiceRole.entities.RateLimitTracker.create({
      key: `geocode:${userEmail}`,
      limit_type: 'geocode_request',
      request_count: 1,
      window_start: now,
      window_duration_seconds: 2
    }).catch(e => console.debug('Rate limit record creation failed (non-critical):', e.message));
  } catch (error) {
    console.debug('Geocode rate limit check failed (non-critical):', error.message);
  }

  try {
    const params = new URLSearchParams({
      q: address,
      format: 'json',
      limit: '1'
    });

    const response = await fetch(`${NOMINATIM_URL}?${params}`, {
      headers: {
        'User-Agent': 'SurfCoast-Marketplace/1.0'
      },
      timeout: 10000 // 10 second timeout
    });

    if (!response.ok) {
      console.warn(`Nominatim API returned ${response.status}: ${response.statusText}`);
      return null;
    }

    const data = await response.json();
    if (!Array.isArray(data) || data.length === 0) {
      console.warn(`No geocoding results for: ${address}`);
      return null;
    }

    const result = data[0];
    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name
    };
  } catch (error) {
    console.error(`Geocoding error for "${address}":`, error.message);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const { address } = payload;

    if (!address || typeof address !== 'string' || address.trim().length === 0) {
      return Response.json({ error: 'Invalid address' }, { status: 400 });
    }

    const trimmedAddress = address.trim();

    // Check cache first
    try {
      const cached = await base44.asServiceRole.entities.GeocodeCache.filter({
        address_hash: hashAddress(trimmedAddress)
      });

      if (cached && cached.length > 0) {
        const cacheEntry = cached[0];
        const cacheAge = Date.now() - new Date(cacheEntry.created_date).getTime();

        if (cacheAge < CACHE_DURATION_MS && cacheEntry.result) {
          console.log(`Cache hit for: ${trimmedAddress}`);
          return Response.json({ ...cacheEntry.result, cached: true });
        }
      }
    } catch (e) {
      console.warn('Cache lookup failed:', e.message);
    }

    // Geocode (pass base44 for database-backed rate limiting)
    const result = await geocodeWithNominatim(trimmedAddress, base44);

    if (!result) {
      return Response.json(
        { error: 'Could not geocode address', address: trimmedAddress },
        { status: 400 }
      );
    }

    // Cache result
    try {
      await base44.asServiceRole.entities.GeocodeCache.create({
        address: trimmedAddress,
        address_hash: hashAddress(trimmedAddress),
        result: {
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName
        }
      });
    } catch (e) {
      console.warn('Failed to cache geocode result:', e.message);
    }

    return Response.json({
      ...result,
      cached: false
    });
  } catch (error) {
    console.error('[geocodeJobLocationRobust] Error:', error.message);
    return Response.json(
      { error: 'Geocoding service error', details: error.message },
      { status: 500 }
    );
  }
});

function hashAddress(address) {
  // Simple hash for cache key
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}