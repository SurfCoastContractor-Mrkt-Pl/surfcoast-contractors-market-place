Deno.serve(async (req) => {
  try {
    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY is not set');
      return Response.json({ error: 'Stripe key not configured' }, { status: 500 });
    }

    // CORS headers for public endpoint
    return Response.json(
      { publishableKey },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching Stripe key:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});