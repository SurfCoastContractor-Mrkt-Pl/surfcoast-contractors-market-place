import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Allow authenticated users OR internal automation calls
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      const internalKey = req.headers.get('x-internal-key');
      const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
      if (!expectedKey || internalKey !== expectedKey) {
        console.warn('Unauthorized sendCustomerWelcomeEmail request');
        return Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const { event, data } = await req.json();

    if (!data || !data.email || !data.full_name) {
      console.warn('Missing required customer data');
      return Response.json({ success: false, error: 'Missing customer data' }, { status: 400 });
    }

    const { email, full_name } = data;

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: email,
      from_name: 'SurfCoast Contractor Market Place',
      subject: 'Welcome to SurfCoast Contractor Market Place!',
      body: `Hello ${full_name},

Welcome to SurfCoast Contractor Market Place! We're excited to have you join our community of customers and contractors.

Get started:
• Browse skilled contractors in your area
• Post a job and get quotes
• Collaborate with professionals you trust

If you have any questions, feel free to reach out.

Happy hiring!

SurfCoast Team`,
    });

    return Response.json({ success: true });
    } catch (error) {
    console.error('Error sending welcome email');
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
    }
});