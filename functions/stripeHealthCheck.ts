import Stripe from 'npm:stripe@17.5.0';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
    const publishableKey = Deno.env.get('STRIPE_PUBLISHABLE_KEY');

    // Validate keys exist and have correct format
    if (!secretKey || !secretKey.startsWith('sk_')) {
      return Response.json({
        status: 'error',
        message: 'Invalid STRIPE_SECRET_KEY configuration',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    if (!publishableKey || !publishableKey.startsWith('pk_')) {
      return Response.json({
        status: 'error',
        message: 'Invalid STRIPE_PUBLISHABLE_KEY configuration',
        timestamp: new Date().toISOString(),
      }, { status: 500 });
    }

    // Test API connectivity
    const account = await stripe.account.retrieve();

    return Response.json({
      status: 'healthy',
      stripe_account_id: account.id,
      mode: account.object === 'account' ? 'live' : 'test',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Stripe health check failed');

    let statusCode = 500;
    let errorMessage = 'Stripe API error';

    if (error.type === 'StripeAuthenticationError') {
      statusCode = 401;
      errorMessage = 'Stripe authentication failed';
    } else if (error.type === 'StripeNetworkError') {
      statusCode = 503;
      errorMessage = 'Stripe API unavailable';
    } else if (error.statusCode === 429) {
      statusCode = 429;
      errorMessage = 'Rate limited by Stripe';
    }

    return Response.json({
      status: 'error',
      message: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  }
});