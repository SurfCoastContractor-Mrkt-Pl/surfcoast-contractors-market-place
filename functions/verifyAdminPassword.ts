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

  try {
    const base44 = createClientFromRequest(req);
    const { password } = await req.json();

    if (!password) {
      return Response.json({ error: 'Password required' }, { status: 400 });
    }

    // Get the stored admin password hash from environment
    const storedHash = Deno.env.get('ADMIN_PASSWORD_HASH');
    
    if (!storedHash) {
      console.error('ADMIN_PASSWORD_HASH not configured');
      return Response.json(
        { error: 'Admin password not configured' },
        { status: 500 }
      );
    }

    // Verify the password
    const isValid = await verifyPassword(password, storedHash);

    if (!isValid) {
      console.warn('Invalid admin password attempt');
      return Response.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }

    // Password is valid - set a secure session token
    const token = crypto.getRandomValues(new Uint8Array(32));
    const tokenHex = Array.from(token)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return Response.json({
      success: true,
      token: tokenHex,
      message: 'Admin password verified'
    });
  } catch (error) {
    console.error('Admin password verification error:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});