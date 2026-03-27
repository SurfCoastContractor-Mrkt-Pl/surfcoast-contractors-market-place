import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify authenticated user or internal service key
    const internalKey = req.headers.get('x-internal-key');
    const validInternalKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    const isInternalCall = internalKey && validInternalKey && internalKey === validInternalKey;

    if (!isInternalCall) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const body = await req.json();
    const { action, proposal_id, customer_email, contractor_email, job_title, cost_amount, contractor_name, customer_name } = body;

    // If called by an authenticated user, verify they are a party to this communication
    if (!isInternalCall) {
      const user = await base44.auth.me();
      const userEmail = user.email.toLowerCase();
      if (userEmail !== customer_email?.toLowerCase() && userEmail !== contractor_email?.toLowerCase()) {
        return Response.json({ error: 'Forbidden: You are not a party to this quote' }, { status: 403 });
      }
    }

    if (action !== 'email_only') {
      return Response.json({ error: 'Only email_only action supported' }, { status: 400 });
    }

    if (!contractor_email || !customer_email || !job_title) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Notify contractor that quote was accepted
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: contractor_email,
      from_name: 'SurfCoast Marketplace',
      subject: `Quote accepted - ${job_title}`,
      body: `Hi ${contractor_name},\n\n${customer_name} has accepted your quote of $${parseFloat(cost_amount || 0).toFixed(2)} for the job: "${job_title}".\n\nLog in to your account to view the confirmed scope of work and coordinate next steps.\n\nSurfCoast Marketplace`,
    });

    // Notify customer that job is confirmed
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: customer_email,
      from_name: 'SurfCoast Marketplace',
      subject: `Job confirmed - ${job_title}`,
      body: `Hi ${customer_name},\n\nYour job "${job_title}" has been confirmed with ${contractor_name} for $${parseFloat(cost_amount || 0).toFixed(2)}.\n\nLog in to your account to view the scope of work and track progress.\n\nSurfCoast Marketplace`,
    });

    console.log(`Quote acceptance emails sent for job: ${job_title}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('respondToQuote error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});