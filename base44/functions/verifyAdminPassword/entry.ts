import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Using bcrypt for secure password verification
// Note: bcrypt should be imported but for Deno we'll use the crypto API for PBKDF2
// as a more standard approach

const crypto = globalThis.crypto;

// Simple PBKDF2-based password verification (alternative to bcrypt for Deno)
async function verifyPassword(password, hash) {
  try {
    // Hash format: algorithm$iterations$salt$hash
    const [algorithm, iterations, salt, storedHash] = hash.split('$');
    
    if (algorithm !== 'pbkdf2') {
      console.error('Unknown hash algorithm');
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

  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);
    const { password } = await req.json();
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';

    if (!password) {
      return Response.json({ error: 'Password required' }, { status: 400 });
    }

    // Get the stored admin password hash from environment
    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    
    if (!storedHash) {
      console.error(`[${requestId}] ADMIN_PASSWORD_HASH not configured`);
      return Response.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // Rate limiting (max 5 attempts per hour per IP)
    const now = new Date();
    const windowStart = new Date(now.getTime() - 3600000); // 1 hour ago

    const existingLimit = await base44.asServiceRole.entities.RateLimitTracker.filter({
      key: `admin_password_verify:${clientIP}`,
      limit_type: 'admin_password_verify',
      window_start: { $gte: windowStart.toISOString() }
    });

    if (existingLimit?.length > 0) {
      const tracker = existingLimit[0];
      if (tracker.request_count >= 5) {
        console.warn(`[${requestId}] Rate limit exceeded for admin password attempt from ${clientIP}`);
        return Response.json({ 
          success: false, 
          error: 'Too many attempts. Please try again later.' 
        }, { status: 429 });
      }

      // Increment attempt counter
      await base44.asServiceRole.entities.RateLimitTracker.update(tracker.id, {
        request_count: tracker.request_count + 1
      });
    } else {
      // Create new rate limit record
      await base44.asServiceRole.entities.RateLimitTracker.create({
        key: `admin_password_verify:${clientIP}`,
        limit_type: 'admin_password_verify',
        request_count: 1,
        window_start: now.toISOString(),
        window_duration_seconds: 3600
      });
    }

    // Verify the password
    const isValid = await verifyPassword(password, storedHash);

    if (!isValid) {
      console.warn(`[${requestId}] Invalid admin password attempt from ${clientIP}`);
      return Response.json(
        { error: 'Invalid password' },
        { status: 403 }
      );
    }

    // Password is valid - set a secure session token
    const token = crypto.getRandomValues(new Uint8Array(32));
    const tokenHex = Array.from(token)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    console.log(`[${requestId}] Admin password verified successfully for ${clientIP}`);
    return Response.json({
      success: true,
      token: tokenHex,
      message: 'Admin password verified'
    });
  } catch (error) {
    console.error(`[${requestId}] Admin password verification error:`, error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});