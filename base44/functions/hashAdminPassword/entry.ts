// This is a utility function to hash admin passwords using PBKDF2
// Run this once to generate a hash from the plaintext password, then store it as ADMIN_PASSWORD_HASH secret
// Usage: Call this with { password: "your_password" }

const crypto = globalThis.crypto;

async function hashPassword(password) {
  try {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltString = Array.from(salt)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const passwordBuffer = new TextEncoder().encode(password);
    const iterations = 100000;

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

    const hash = Array.from(new Uint8Array(derivedKey))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    // Return in format: algorithm$iterations$salt$hash
    return `pbkdf2$${iterations}$${saltString}$${hash}`;
  } catch (error) {
    console.error('Password hashing error:', error);
    throw error;
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { password } = await req.json();

    if (!password || password.length < 8) {
      return Response.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const hash = await hashPassword(password);

    return Response.json({
      success: true,
      hash: hash,
      instructions: 'Store this hash as the ADMIN_PASSWORD_HASH secret in your app settings'
    });
  } catch (error) {
    console.error('Error hashing password:', error);
    return Response.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
});