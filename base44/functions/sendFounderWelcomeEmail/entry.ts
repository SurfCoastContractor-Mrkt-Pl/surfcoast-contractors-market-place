import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

/**
 * Sends personalized founder welcome email to new founding members.
 * Includes BCC to admin emails and logs the sent message.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const payload = await req.json();
    const { to, subject, body, bcc_emails = [] } = payload;

    if (!to || !subject || !body) {
      return Response.json(
        { error: 'Missing required fields: to, subject, body' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return Response.json({ error: 'Invalid recipient email' }, { status: 400 });
    }

    // Send main email
    const emailResult = await base44.integrations.Core.SendEmail({
      to,
      subject,
      body
    });

    if (!emailResult) {
      return Response.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    // Send BCC copies to admin emails
    const bccPromises = (bcc_emails || [])
      .filter(email => emailRegex.test(email))
      .map(email =>
        base44.integrations.Core.SendEmail({
          to: email,
          subject: `[BCC] ${subject}`,
          body: `[BCC Copy - Original recipient: ${to}]\n\n${body}`
        }).catch(err => {
          console.error(`Failed to send BCC to ${email}:`, err.message);
          return null;
        })
      );

    const bccResults = await Promise.all(bccPromises);
    const bccSent = bccResults.filter(r => r).length;

    // Log the sent email
    const logEntry = await base44.asServiceRole.entities.SentEmail.create({
      to_email: to,
      subject,
      body,
      sent_by: user.email,
      sent_at: new Date().toISOString()
    }).catch(err => {
      console.error('Failed to log sent email:', err.message);
      return null;
    });

    console.log(`Email sent to ${to}. BCC sent to ${bccSent}/${bcc_emails.length} admins. Logged: ${!!logEntry}`);

    return Response.json({
      success: true,
      recipient: to,
      subject,
      bcc_sent: bccSent,
      bcc_total: bcc_emails.length,
      logged: !!logEntry,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('sendFounderWelcomeEmail error:', error.message);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});