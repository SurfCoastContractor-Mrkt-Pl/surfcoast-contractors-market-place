import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { action, proposal_id, customer_email, contractor_email, job_title, cost_amount, contractor_name, customer_name } = body;

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