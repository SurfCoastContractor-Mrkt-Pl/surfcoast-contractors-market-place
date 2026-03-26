import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const maxMessageLength = 5000;

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Input validation
    const { name, email, subject, message, type = 'general' } = payload;

    // Validate name
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return Response.json({ error: 'Invalid name' }, { status: 400 });
    }

    // Validate email
    const cleanEmail = email?.trim().toLowerCase();
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    // Validate subject
    if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.length > 200) {
      return Response.json({ error: 'Invalid subject' }, { status: 400 });
    }

    // Validate message
    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > maxMessageLength) {
      return Response.json({ error: 'Invalid message (10-5000 characters)' }, { status: 400 });
    }

    // Validate type
    const validTypes = ['general', 'bug', 'feature_request', 'partnership'];
    if (!validTypes.includes(type)) {
      return Response.json({ error: 'Invalid message type' }, { status: 400 });
    }

    // Sanitize inputs
    const sanitizedData = {
      name: name.trim().substring(0, 100),
      email: cleanEmail,
      subject: subject.trim().substring(0, 200),
      message: message.trim().substring(0, maxMessageLength),
      type,
      timestamp: new Date().toISOString()
    };

    // Send to admin
    try {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: Deno.env.get('ADMIN_ALERT_EMAIL') || 'admin@surfcoast.local',
        from_name: 'SurfCoast Contact Form',
        subject: `[${type.toUpperCase()}] ${sanitizedData.subject}`,
        body: `New contact form submission\n\nFrom: ${sanitizedData.name}\nEmail: ${sanitizedData.email}\nType: ${sanitizedData.type}\nTime: ${sanitizedData.timestamp}\n\nMessage:\n${sanitizedData.message}`
      });

      console.log(`[Contact Form] Submitted by ${sanitizedData.email} (${sanitizedData.type})`);
    } catch (emailError) {
      console.error('[sendAdminContactMessageSecure] Email send failed:', emailError.message);
      return Response.json(
        { error: 'Failed to send message', details: 'Please try again later' },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: 'Thank you for your message. We will respond shortly.'
    });
  } catch (error) {
    console.error('[sendAdminContactMessageSecure] Error:', error.message);
    return Response.json({ error: 'Message submission failed' }, { status: 500 });
  }
});