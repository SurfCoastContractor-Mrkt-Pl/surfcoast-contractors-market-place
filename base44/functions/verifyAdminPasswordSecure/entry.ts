import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;

async function checkRateLimit(base44, ip) {
  try {
    const now = new Date().toISOString();
    const window = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    const windowStart = new Date(Date.now() - window).toISOString();

    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `admin_password:${ip}`,
      window_start: { $gte: windowStart }
    });

    if (records && records.length > 0) {
      const record = records[0];
      if (record.request_count >= RATE_LIMIT_ATTEMPTS) {
        const remainingSeconds = Math.ceil((new Date(record.window_start).getTime() + window - Date.now()) / 1000);
        return { allowed: false, locked: true, remainingSeconds };
      }
    }
    return { allowed: true, locked: false };
  } catch (error) {
    console.warn('[RATE_LIMIT_ERROR]', error.message);
    return { allowed: true, locked: false };
  }
}

async function recordFailedAttempt(base44, ip) {
  try {
    const now = new Date().toISOString();
    const window = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    const windowStart = new Date(Date.now() - window).toISOString();

    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `admin_password:${ip}`,
      window_start: { $gte: windowStart }
    });

    if (records && records.length > 0) {
      await base44.asServiceRole.entities.RateLimitTracker.update(records[0].id, {
        request_count: records[0].request_count + 1
      });
    } else {
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: `admin_password:${ip}`,
        limit_type: 'admin_password',
        request_count: 1,
        window_start: now,
        window_duration_seconds: Math.floor(window / 1000)
      });
    }
  } catch (error) {
    console.warn('[RECORD_ATTEMPT_ERROR]', error.message);
  }
}

async function clearAttempts(base44, ip) {
  try {
    const window = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    const windowStart = new Date(Date.now() - window).toISOString();

    const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `admin_password:${ip}`,
      window_start: { $gte: windowStart }
    });

    if (records && records.length > 0) {
      await base44.asServiceRole.entities.RateLimitTracker.delete(records[0].id);
    }
  } catch (error) {
    console.warn('[CLEAR_ATTEMPTS_ERROR]', error.message);
  }
}

async function verifyPassword(password, hash) {
  try {
    // Secure PBKDF2 verification
    const [algorithm, iterations, salt, storedHash] = hash.split('$');
    
    if (algorithm !== 'pbkdf2') {
      return false;
    }

    const saltBuffer = new TextEncoder().encode(salt);
    const passwordBuffer = new TextEncoder().encode(password);
    const iterCount = parseInt(iterations, 10);

    const derivedKey = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltBuffer,
        iterations: iterCount,
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

    const derivedHash = Array.from(new Uint8Array(derivedKey))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return derivedHash === storedHash;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const payload = await req.json();
    const { password } = payload;

    if (!password) {
      return Response.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Extract IP server-side — never trust client-provided IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim()
      || req.headers.get('x-real-ip')
      || req.headers.get('cf-connecting-ip')
      || 'unknown';

    const base44 = createClientFromRequest(req);

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(base44, ip);
    if (!rateLimitCheck.allowed) {
      console.warn(`[Admin Auth] Rate limit exceeded for IP: ${ip}`);
      return Response.json(
        { 
          error: 'Too many failed attempts', 
          locked: true,
          retryAfter: rateLimitCheck.remainingSeconds
        },
        { status: 429 }
      );
    }

    // Verify password using secure PBKDF2
    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const isValid = await verifyPassword(password, storedHash);

    if (!isValid) {
      console.warn(`[Admin Auth] Failed login attempt from IP: ${ip}`);
      await recordFailedAttempt(base44, ip);
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Clear failed attempts on success
    await clearAttempts(base44, ip);

    console.log(`[Admin Auth] Successful login from IP: ${ip}`);

    return Response.json({
      success: true,
      token: generateSessionToken(ip)
    });
  } catch (error) {
    console.error('[verifyAdminPasswordSecure] Error:', error.message);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
});

function generateSessionToken(ip) {
  const timestamp = Date.now();
  const randomBytes = new Uint8Array(32);
  crypto.getRandomValues(randomBytes);
  const randomHex = Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
  const token = `admin:${timestamp}:${randomHex}`;
  return token;
}