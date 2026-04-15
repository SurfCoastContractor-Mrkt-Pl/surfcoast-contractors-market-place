import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Webhook handler for incoming SMS from Twilio
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    // Twilio signature cryptographic verification
    const twilioSig = req.headers.get('x-twilio-signature') || '';
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN') || '';

    if (!twilioSig || !authToken) {
      console.warn('[SECURITY] Received SMS webhook without Twilio signature or auth token not configured');
      return Response.json({ error: 'Forbidden: Missing Twilio signature' }, { status: 403 });
    }

    // Reconstruct the full URL for HMAC validation
    const url = req.url;
    const rawBody = await req.text();
    const params = new URLSearchParams(rawBody);

    // Build the string Twilio signs: URL + sorted params
    const sortedParams = [...params.entries()].sort(([a], [b]) => a.localeCompare(b));
    let signingString = url;
    for (const [k, v] of sortedParams) {
      signingString += k + v;
    }

    // HMAC-SHA1 verification using Web Crypto API
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      'raw', enc.encode(authToken), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']
    );
    const sigBytes = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(signingString));
    const expectedSig = 'sha1=' + Array.from(new Uint8Array(sigBytes))
      .map(b => b.toString(16).padStart(2, '0')).join('');

    // Twilio sends Base64-encoded HMAC, convert for comparison
    const expectedBase64 = btoa(String.fromCharCode(...new Uint8Array(sigBytes)));
    if (twilioSig !== expectedBase64) {
      console.warn('[SECURITY] Twilio signature mismatch — possible spoofing attempt');
      return Response.json({ error: 'Forbidden: Invalid Twilio signature' }, { status: 403 });
    }

    // Re-parse since we consumed the body above
    const formData = new URLSearchParams(rawBody);

    // Parse verified Twilio SMS webhook fields
    const from = formData.get('From');
    const body = formData.get('Body');
    const messageSid = formData.get('MessageSid');
    const to = formData.get('To');

    if (!from || !body) {
      return Response.json({ error: 'Missing From or Body' }, { status: 400 });
    }

    // TODO: Find or create conversation based on phone number
    // For now, log the incoming message
    console.log(`Incoming SMS from ${from}: ${body}`);

    // Placeholder response
    return Response.json({
      success: true,
      message: 'SMS received',
      note: 'Full Twilio integration pending',
    });
  } catch (error) {
    console.error('SMS Receive Error:', error);
    return Response.json(
      { error: `Failed to receive SMS: ${error.message}` },
      { status: 500 }
    );
  }
});