import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    // Create a new price for Wave FO Premium at $100/month
    const price = await stripe.prices.create({
      product: 'prod_UDvVKupuinsT6F', // Wave FO Premium product
      unit_amount: 10000, // $100.00 in cents
      currency: 'usd',
      recurring: {
        interval: 'month',
        interval_count: 1,
      },
      nickname: 'Wave FO Premium $100/month',
    });

    console.log('New price created:', price.id, price.unit_amount / 100);

    return Response.json({ 
      success: true, 
      priceId: price.id,
      amount: '$100.00/month',
      message: 'Wave FO Premium $100/month price created. Update STRIPE_WAVE_FO_PREMIUM_PRICE_ID secret with this ID and manually rename Residential Wave Bundle in Stripe to "Wave FO Premium + Subscription Communication Bundle"'
    });
  } catch (error) {
    console.error('Error creating price:', error.message);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});