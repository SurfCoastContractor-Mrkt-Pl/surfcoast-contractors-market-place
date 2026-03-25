Deno.serve(async (req) => {
  try {
    // Only allow GET requests
    if (req.method !== 'GET') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY is not set');
      return Response.json({ error: 'Stripe key not configured' }, { status: 500 });
    }

    const subscriptionPriceId = (Deno.env.get("STRIPE_SUBSCRIPTION_PRICE_ID") || '').trim().replace(/\.$/, '');

    // Add cache headers for performance
    return new Response(
      JSON.stringify({ publishableKey: publishableKey.trim(), subscriptionPriceId }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
        }
      }
    );
  } catch (error) {
    console.error('Error fetching Stripe key:', error);
    return Response.json({ error: 'Unable to load payment service' }, { status: 500 });
  }
});