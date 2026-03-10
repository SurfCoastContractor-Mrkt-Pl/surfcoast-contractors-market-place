import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { userEmail, userName, category, subject, message } = await req.json();

    if (!userEmail || !userName || !category || !subject || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
    if (!adminEmail) {
      console.error('ADMIN_ALERT_EMAIL not configured');
      return Response.json({ error: 'Admin email not configured' }, { status: 500 });
    }

    const base44 = createClientFromRequest(req);

    await base44.integrations.Core.SendEmail({
      to: adminEmail,
      from_name: userName || userEmail,
      subject: `[${category}] ${subject}`,
      body: `From: ${userName || 'Unknown'} <${userEmail}>\nCategory: ${category}\nSubject: ${subject}\n\n${message}`,
    });

    console.log(`Admin contact message sent from ${userEmail} to ${adminEmail}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending admin contact message:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});