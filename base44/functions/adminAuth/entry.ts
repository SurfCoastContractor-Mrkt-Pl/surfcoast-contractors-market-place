import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * SECURITY: Password verification using PBKDF2 hashing
 * Stored password hash format: pbkdf2$iterations$salt$hash
 */
async function verifyPasswordHash(providedPassword, storedHash) {
  try {
    const [algorithm, iterationsStr, saltString, storedHashValue] = storedHash.split('$');
    if (algorithm !== 'pbkdf2') return false;

    const iterations = parseInt(iterationsStr, 10);
    const salt = new Uint8Array(saltString.match(/[\da-f]{2}/gi).map(h => parseInt(h, 16)));

    const passwordBuffer = new TextEncoder().encode(providedPassword);
    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256',
      },
      await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        'PBKDF2',
        false,
        ['deriveBits']
      ),
      256
    );

    const computedHash = Array.from(new Uint8Array(derivedKey))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Constant-time comparison to prevent timing attacks
    let result = 0;
    for (let i = 0; i < Math.max(computedHash.length, storedHashValue.length); i++) {
      result |= (computedHash.charCodeAt(i) || 0) ^ (storedHashValue.charCodeAt(i) || 0);
    }
    return result === 0;
  } catch (err) {
    console.error('Password verification error:', err);
    return false;
  }
}

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const providedPassword = body?.password;
    const serviceKey = body?.service_key;
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    const passwordHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const expectedServiceKey = Deno.env.get('INTERNAL_SERVICE_KEY');

    // Verify password hash is configured
    if (!passwordHash) {
      console.error(`[${requestId}] ADMIN_PASSWORD_HASH not configured`);
      return Response.json({ success: false, error: 'Admin dashboard not configured' }, { status: 500 });
    }

    // Rate limiting key (prioritize authenticated user, fall back to IP)
    let rateLimitKey = clientIP;
    let isAuthenticatedUser = false;
    let isAdmin = false;
    try {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const user = await base44.auth.me();
        if (user?.email) {
          rateLimitKey = user.email;
          isAuthenticatedUser = true;
          isAdmin = user.role === 'admin';
        }
      }
    } catch {
      // Fall through to IP-based rate limiting
    }

    // Grant instant access to authenticated admins (no password needed)
    if (isAdmin) {
      console.log(`[${requestId}] Admin dashboard access granted for ${rateLimitKey} (authenticated admin)`);
      return Response.json({ success: true });
    }

    // Check rate limit (max 5 attempts per hour)
    const now = new Date();
    const windowStart = new Date(now.getTime() - 3600000); // 1 hour ago

    const existingLimit = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: rateLimitKey,
      limit_type: 'admin_contact',
      window_start: { $gte: windowStart.toISOString() }
    });

    if (existingLimit?.length > 0) {
      const tracker = existingLimit[0];
      if (tracker.request_count >= 5) {
        console.warn(`[${requestId}] Rate limit exceeded for ${rateLimitKey} (${tracker.request_count} attempts)`);
        return Response.json({ 
          success: false, 
          error: 'Too many login attempts. Please try again later.' 
        }, { status: 429 });
      }

      // Increment attempt counter
      await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
        request_count: tracker.request_count + 1
      });
    } else {
      // Create new rate limit record
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: rateLimitKey,
        limit_type: 'admin_contact',
        request_count: 1,
        window_start: now.toISOString(),
        window_duration_seconds: 3600
      });
    }

    // Verify password against hash
    const passwordMatch = providedPassword && await verifyPasswordHash(providedPassword, passwordHash);
    
    if (!passwordMatch) {
      console.warn(`[${requestId}] Invalid admin dashboard password attempt from ${rateLimitKey}`);
      return Response.json({ success: false, error: 'Invalid password.' }, { status: 403 });
    }

    // Password validated successfully
    console.log(`[${requestId}] Admin dashboard access granted for ${rateLimitKey}`);
    return Response.json({ success: true });
  } catch (error) {
    // Never expose internal error details in response
    console.error(`[${requestId}] adminAuth error - request processing failed`);
    return Response.json({ success: false, error: 'Server error.' }, { status: 500 });
  }
});