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

    // Return immediately with queued status, send emails in background
    const requestId = crypto.randomUUID();
    
    // Fire and forget with timeout protection
    (async () => {
      try {
        console.log(`[${requestId}] Starting email send for ${to}`);

        // Send main email with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout

        let emailResult;
        try {
          emailResult = await Promise.race([
            base44.integrations.Core.SendEmail({ to, subject, body }),
            new Promise((_, reject) => 
              controller.signal.addEventListener('abort', () => reject(new Error('Email send timeout')))
            )
          ]);
          clearTimeout(timeoutId);
        } catch (timeoutErr) {
          clearTimeout(timeoutId);
          console.error(`[${requestId}] Email send timeout for ${to}:`, timeoutErr.message);
          throw timeoutErr;
        }

        if (!emailResult) {
          console.error(`[${requestId}] Email send failed for ${to}`);
          return;
        }

        console.log(`[${requestId}] Email sent successfully to ${to}`);

        // Send BCC copies in parallel
        const bccPromises = (bcc_emails || [])
          .filter(email => emailRegex.test(email))
          .map(email =>
            base44.integrations.Core.SendEmail({
              to: email,
              subject: `[BCC] ${subject}`,
              body: `[BCC Copy - Original recipient: ${to}]\n\n${body}`
            }).catch(err => {
              console.error(`[${requestId}] BCC failed for ${email}:`, err.message);
              return null;
            })
          );

        const bccResults = await Promise.all(bccPromises);
        const bccSent = bccResults.filter(r => r).length;
        console.log(`[${requestId}] BCC sent to ${bccSent}/${bcc_emails.length} admins`);

        // Log the sent email
        await base44.asServiceRole.entities.SentEmail.create({
          to_email: to,
          subject,
          body,
          sent_by: user.email,
          sent_at: new Date().toISOString()
        }).catch(err => {
          console.error(`[${requestId}] Failed to log sent email:`, err.message);
        });

        console.log(`[${requestId}] Email sequence completed for ${to}`);
      } catch (bgErr) {
        console.error(`[${requestId}] Background email process error:`, bgErr.message);
      }
    })();

    // Return success immediately
    return Response.json({
      success: true,
      recipient: to,
      subject,
      message: 'Email queued for sending',
      request_id: requestId,
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