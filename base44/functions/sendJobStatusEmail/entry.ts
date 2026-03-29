import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { scope_id, customer_email, customer_name, job_title, contractor_name } = body;

    if (!customer_email || !job_title) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: customer_email,
      subject: `Your Scope of Work is Approved: ${job_title}`,
      body: `Hi ${customer_name},\n\n${contractor_name} has approved your scope of work for "${job_title}". Your job is now confirmed and work can begin.\n\nYou can view the details and track progress in your account.\n\nThank you!`
    });

    return Response.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('Send job status email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});