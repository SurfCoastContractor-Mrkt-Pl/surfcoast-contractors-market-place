import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@14.19.0';

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

Deno.serve(async (req) => {
  try {
    // Authenticate the user
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized: User must be authenticated' }, { status: 401 });
    }

    const { invoiceId, invoiceNumber, customerEmail, customerName, amount, serviceName } = await req.json();

    // Validate required fields
    if (!invoiceId || !amount || !customerEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify the customerEmail matches the authenticated user or is in their account
    if (customerEmail !== user.email) {
      return Response.json({ error: 'Forbidden: Invoice email does not match authenticated user' }, { status: 403 });
    }

    // Validate amount is positive
    if (amount <= 0) {
      return Response.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice Payment: ${invoiceNumber}`,
              description: serviceName || 'Professional Services',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: customerEmail,
      success_url: `${Deno.env.get("APP_URL")}/Success?session_id={CHECKOUT_SESSION_ID}&invoice_id=${invoiceId}`,
      cancel_url: `${Deno.env.get("APP_URL")}/Cancel?invoice_id=${invoiceId}`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        invoice_id: invoiceId,
        invoice_number: invoiceNumber,
        customer_email: customerEmail,
      },
    });

    return Response.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (error) {
    console.error('Invoice checkout error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});