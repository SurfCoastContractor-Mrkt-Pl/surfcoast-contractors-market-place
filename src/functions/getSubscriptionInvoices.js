import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
const stripe = await import('npm:stripe@14.0.0').then((mod) => new mod.default(Deno.env.get('STRIPE_SECRET_KEY')));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { stripeCustomerId } = await req.json();

    if (!stripeCustomerId) {
      return Response.json({ error: 'Missing stripeCustomerId' }, { status: 400 });
    }

    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 50,
    });

    return Response.json({
      invoices: invoices.data.map((inv) => ({
        id: inv.id,
        created: inv.created,
        amount: inv.amount_paid,
        total: inv.total,
        status: inv.status,
        paid: inv.paid,
        invoice_pdf: inv.invoice_pdf,
      })),
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});