import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { scope_id, customer_email, customer_name, job_title, contractor_name } = body;

    if (!customer_email || !job_title) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: customer_email,
      subject: `Please Review Your Work: ${job_title}`,
      body: `Hi ${customer_name},\n\n${contractor_name} has completed the work on "${job_title}". We'd love to hear about your experience!\n\nPlease take a moment to review the contractor and leave feedback. Your review helps us maintain quality and helps other customers make informed decisions.\n\nThank you for using our platform!`
    });

    return Response.json({ success: true, message: 'Review request email sent' });
  } catch (error) {
    console.error('Send review request email error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});