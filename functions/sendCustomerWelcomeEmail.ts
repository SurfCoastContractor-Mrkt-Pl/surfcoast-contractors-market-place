import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data || !data.email || !data.full_name) {
      console.warn('Missing required customer data');
      return Response.json({ success: false, error: 'Missing customer data' }, { status: 400 });
    }

    const { email, full_name } = data;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      subject: 'Welcome to ContractorHub!',
      body: `Hello ${full_name},

Welcome to ContractorHub! We're excited to have you join our community of customers and contractors.

Get started:
• Browse skilled contractors in your area
• Post a job and get quotes
• Collaborate with professionals you trust

If you have any questions, feel free to reach out.

Happy hiring!

ContractorHub Team`,
    });

    console.log(`Welcome email sent to ${email}`);
    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending welcome email:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});