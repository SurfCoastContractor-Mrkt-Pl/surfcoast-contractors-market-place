import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@16.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    
    // SECURITY: Only admins can access payment validation utility
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      console.warn(`[AUTH_VIOLATION] Unauthorized access attempt on securePaymentValidator — user: ${user?.email ?? 'anonymous'}`);
      return Response.json(
        { error: 'Forbidden: Only admins can access payment validation' },
        { status: 403 }
      );
    }
    
    const payload = await req.json();

    // Validate required fields
    const { amount, currency, email, purpose } = payload;

    if (!amount || typeof amount !== 'number' || amount <= 0 || amount > 999999.99) {
      return Response.json({ error: 'Invalid amount' }, { status: 400 });
    }

    if (!currency || typeof currency !== 'string' || currency !== 'usd') {
      return Response.json({ error: 'Invalid currency' }, { status: 400 });
    }

    if (!email || !email.includes('@')) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!purpose || typeof purpose !== 'string' || purpose.length > 200) {
      return Response.json({ error: 'Invalid purpose' }, { status: 400 });
    }

    // Verify payment amount matches Stripe product
    const validAmounts = {
      'quote': 175, // $1.75 in cents
      'limited_comm': 150, // $1.50
      'subscription_comm': 5000, // $50.00
    };

    if (!validAmounts[purpose]) {
      return Response.json({ error: 'Invalid payment purpose' }, { status: 400 });
    }

    if (amount * 100 !== validAmounts[purpose]) {
      console.error(`[Payment Validation] Amount mismatch for ${purpose}`, { requested: amount * 100, expected: validAmounts[purpose] });
      return Response.json({ error: 'Invalid amount for this payment type' }, { status: 400 });
    }

    return Response.json({ valid: true, amount, currency, purpose });
  } catch (error) {
    console.error('[securePaymentValidator] Error:', error.message);
    return Response.json({ error: 'Validation failed', details: error.message }, { status: 500 });
  }
});