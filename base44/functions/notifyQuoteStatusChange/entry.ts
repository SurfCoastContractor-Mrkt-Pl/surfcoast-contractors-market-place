import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Reject unauthenticated requests
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { quote_id, event_type } = await req.json();

    if (!quote_id || !event_type) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const quoteResults = await base44.asServiceRole.entities.QuoteRequest.filter({ id: quote_id });
    const quote = quoteResults?.[0];
    if (!quote) {
      return Response.json({ error: 'Quote not found' }, { status: 404 });
    }

    // Verify authorization based on event type
    let isAuthorized = false;
    if (user.role === 'admin') {
      isAuthorized = true;
    } else if (event_type === 'quote_provided') {
      // Only the contractor who provided the quote can notify about it
      isAuthorized = user.email === quote.contractor_email;
    } else if (event_type === 'quote_accepted') {
      // Only the customer can accept a quote
      isAuthorized = user.email === quote.customer_email;
    }

    if (!isAuthorized) {
      return Response.json({ error: 'Forbidden: insufficient permissions for this action' }, { status: 403 });
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
      await base44.asServiceRole.integrations.Core.SendEmail({
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