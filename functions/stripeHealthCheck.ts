import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
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
    console.error('Stripe health check failed:', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
    });

    let statusCode = 500;
    let errorMessage = 'Stripe API error';

    if (error.type === 'StripeAuthenticationError') {
      statusCode = 401;
      errorMessage = 'Stripe authentication failed - API key may be invalid or revoked';
    } else if (error.type === 'StripeNetworkError') {
      statusCode = 503;
      errorMessage = 'Stripe API unavailable - network error';
    } else if (error.statusCode === 429) {
      statusCode = 429;
      errorMessage = 'Rate limited by Stripe';
    }

    return Response.json({
      status: 'error',
      message: errorMessage,
      details: error.message,
      timestamp: new Date().toISOString(),
    }, { status: statusCode });
  }
});