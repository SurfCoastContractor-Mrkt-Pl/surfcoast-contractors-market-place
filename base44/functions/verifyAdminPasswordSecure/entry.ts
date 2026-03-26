import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const RATE_LIMIT_ATTEMPTS = 5;
const RATE_LIMIT_WINDOW_MINUTES = 15;
const failedAttempts = new Map(); // Maps IP to [timestamp, count]

async function checkRateLimit(ip) {
  const now = Date.now();
  const window = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;

  const attempt = failedAttempts.get(ip);
  
  if (attempt && now - attempt.timestamp < window) {
    if (attempt.count >= RATE_LIMIT_ATTEMPTS) {
      const remainingSeconds = Math.ceil((attempt.timestamp + window - now) / 1000);
      return {
        allowed: false,
        locked: true,
        remainingSeconds
      };
    }
  }

  return { allowed: true, locked: false };
}

async function recordFailedAttempt(ip) {
  const now = Date.now();
  const attempt = failedAttempts.get(ip);

  if (attempt) {
    const window = RATE_LIMIT_WINDOW_MINUTES * 60 * 1000;
    if (now - attempt.timestamp < window) {
      attempt.count += 1;
    } else {
      failedAttempts.set(ip, { timestamp: now, count: 1 });
    }
  } else {
    failedAttempts.set(ip, { timestamp: now, count: 1 });
  }
}

async function clearAttempts(ip) {
  failedAttempts.delete(ip);
}

function hashPassword(password) {
  // Simple hash for verification (in production, use bcrypt)
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const payload = await req.json();
    const { password, ip } = payload;

    if (!password || !ip) {
      return Response.json({ error: 'Missing credentials' }, { status: 400 });
    }

    // Check rate limit
    const rateLimitCheck = await checkRateLimit(ip);
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

    // Verify password
    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    const providedHash = hashPassword(password);

    if (providedHash !== storedHash) {
      console.warn(`[Admin Auth] Failed login attempt from IP: ${ip}`);
      await recordFailedAttempt(ip);
      return Response.json({ error: 'Invalid password' }, { status: 401 });
    }

    // Clear failed attempts on success
    await clearAttempts(ip);

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
  const token = `${ip}:${timestamp}:${Math.random().toString(36).substring(7)}`;
  return Buffer.from(token).toString('base64');
}