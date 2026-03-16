import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const body = await req.json();
    const { paymentId } = body;

    if (!paymentId) {
      return Response.json({ error: 'Missing paymentId' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payment = await base44.asServiceRole.entities.Payment.get(paymentId);
    if (!payment) {
      return Response.json({ error: 'Payment not found' }, { status: 404 });
    }

    // Verify user owns this payment
    if (payment.payer_email.toLowerCase() !== user.email.toLowerCase() && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: You can only view your own invoices' }, { status: 403 });
    }

    // Retrieve invoice from Stripe
    let invoice;
    try {
      if (payment.stripe_invoice_id) {
        invoice = await stripe.invoices.retrieve(payment.stripe_invoice_id);
      } else if (payment.stripe_session_id) {
        const session = await stripe.checkout.sessions.retrieve(payment.stripe_session_id);
        if (session.invoice) {
          invoice = await stripe.invoices.retrieve(session.invoice);
        }
      }
    } catch (stripeErr) {
      console.error('Error retrieving invoice from Stripe:', stripeErr.message);
      return Response.json({ error: 'Invoice not available' }, { status: 404 });
    }

    if (!invoice) {
      return Response.json({ error: 'Invoice not found for this payment' }, { status: 404 });
    }

    return Response.json({
      success: true,
      invoiceUrl: invoice.invoice_pdf,
      invoiceNumber: invoice.number,
      amountPaid: invoice.amount_paid,
      dateCreated: new Date(invoice.created * 1000).toISOString(),
    });
  } catch (error) {
    console.error('Error retrieving Stripe invoice:', error.message);
    return Response.json({ error: 'Failed to retrieve invoice' }, { status: 500 });
  }
});