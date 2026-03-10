Deno.serve(async (req) => {
  try {
    const publishableKey = Deno.env.get("STRIPE_PUBLISHABLE_KEY");
    
    if (!publishableKey) {
      console.error('STRIPE_PUBLISHABLE_KEY is not set');
      return Response.json({ error: 'Stripe key not configured' }, { status: 500 });
    }

    const subscriptionPriceId = Deno.env.get("STRIPE_SUBSCRIPTION_PRICE_ID");

    return Response.json({ publishableKey, subscriptionPriceId });
  } catch (error) {
    console.error('Error fetching Stripe key:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});