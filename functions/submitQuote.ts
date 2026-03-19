import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { action, quote_request_id, contractor_id, quote_amount, quote_message, customer_email, customer_name, contractor_name, job_title } = body;

    // Verify the authenticated user is the contractor submitting the quote
    if (quote_request_id) {
      const quote = await base44.asServiceRole.entities.QuoteRequest.get(quote_request_id);
      if (!quote || quote.contractor_email?.toLowerCase() !== user.email.toLowerCase()) {
        return Response.json({ error: 'Forbidden: You are not the contractor on this quote' }, { status: 403 });
      }
    } else {
      // No quote_request_id — verify via contractor record
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: user.email });
      if (!contractors || contractors.length === 0) {
        return Response.json({ error: 'Forbidden: Only contractors can submit quotes' }, { status: 403 });
      }
    }

    if (action !== 'email_only') {
      return Response.json({ error: 'Only email_only action supported' }, { status: 400 });
    }

    if (!customer_email || !contractor_name || !job_title) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Send email to customer notifying of new quote
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: customer_email,
      from_name: 'SurfCoast Marketplace',
      subject: `New quote from ${contractor_name} - ${job_title}`,
      body: `Hi ${customer_name},\n\n${contractor_name} has submitted a quote of $${parseFloat(quote_amount || 0).toFixed(2)} for your project: "${job_title}".\n\n${quote_message ? `Message from contractor:\n"${quote_message}"\n\n` : ''}Log in to your account to review and accept or decline this quote.\n\nSurfCoast Marketplace`,
    });

    console.log(`Quote notification sent to ${customer_email} for job: ${job_title}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('submitQuote error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});