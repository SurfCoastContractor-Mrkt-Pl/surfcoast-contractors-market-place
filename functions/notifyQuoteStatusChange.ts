import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { quote_id, event_type } = await req.json();

    if (!quote_id || !event_type) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const quote = await base44.asServiceRole.entities.QuoteRequest.get(quote_id);
    if (!quote) {
      return Response.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Send email based on event type
    let emailSubject = '';
    let emailBody = '';

    if (event_type === 'quote_provided') {
      emailSubject = `Quote received from ${quote.contractor_name}`;
      emailBody = `${quote.contractor_name} has provided a quote of $${quote.quote_amount} for your project: "${quote.work_description}".\n\nLogin to review and accept or reject the quote.`;
    } else if (event_type === 'quote_accepted') {
      emailSubject = 'Quote accepted!';
      emailBody = `Your quote for ${quote.customer_name}'s project has been accepted. Next steps will be sent separately.`;
    }

    if (emailSubject) {
      await base44.integrations.Core.SendEmail({
        to: event_type === 'quote_provided' ? quote.customer_email : quote.contractor_email,
        subject: emailSubject,
        body: emailBody
      });
    }

    return Response.json({ sent: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});