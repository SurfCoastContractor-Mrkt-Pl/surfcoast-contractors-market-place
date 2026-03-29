import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { payer_email, payer_name, amount, purpose } = body;

    if (!payer_email || !amount) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: payer_email,
      subject: `Invoice Reminder: ${purpose || 'Payment Due'}`,
      body: `Hi ${payer_name},\n\nThis is a reminder that you have a payment due for ${purpose || 'your work'}.\n\nAmount Due: $${amount.toFixed(2)}\n\nPlease complete payment at your earliest convenience.\n\nThank you!`
    });

    return Response.json({ success: true, message: 'Reminder email sent' });
  } catch (error) {
    console.error('Send invoice reminder email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});