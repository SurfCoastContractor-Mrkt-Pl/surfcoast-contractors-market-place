import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const RATE_LIMIT_WINDOW = 3600; // 1 hour in seconds
const RATE_LIMIT_THRESHOLD = 5; // Max 5 messages per hour per user

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Require authentication to prevent anonymous spam
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { userName, category, subject, message } = await req.json();

    if (!userName || !category || !subject || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Database-backed rate limiting
    const userKey = user.email;
    const now = new Date();
    const windowStart = new Date(now.getTime() - RATE_LIMIT_WINDOW * 1000);

    try {
      const rateLimitRecords = await base44.asServiceRole.entities.RateLimitTracker.filter({
        key: userKey,
        limit_type: 'admin_contact',
        window_start: { '$gte': windowStart.toISOString() }
      });

      if (rateLimitRecords.length >= RATE_LIMIT_THRESHOLD) {
        return Response.json({ error: 'Rate limit exceeded: maximum 5 messages per hour' }, { status: 429 });
      }

      // Create/update rate limit record
      if (rateLimitRecords.length > 0) {
        await base44.asServiceRole.entities.RateLimitTracker.update(rateLimitRecords[0].id, {
          request_count: rateLimitRecords[0].request_count + 1
        });
      } else {
        await base44.asServiceRole.entities.RateLimitTracker.create({
          key: userKey,
          limit_type: 'admin_contact',
          request_count: 1,
          window_start: now.toISOString(),
          window_duration_seconds: RATE_LIMIT_WINDOW
        });
      }
    } catch (rateLimitError) {
      console.error('Rate limit check failed:', rateLimitError.message);
      // Fail open (allow request) if rate limiting fails
    }

    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
    if (!adminEmail) {
      console.error('ADMIN_ALERT_EMAIL not configured');
      return Response.json({ error: 'Admin email not configured' }, { status: 500 });
    }

    // Validate message length to prevent abuse
    if (message.length > 5000) {
      return Response.json({ error: 'Message too long (max 5000 characters)' }, { status: 400 });
    }

    await base44.integrations.Core.SendEmail({
      to: adminEmail,
      from_name: userName,
      subject: `[${category}] ${subject}`,
      body: `From: ${userName} <${user.email}>\nCategory: ${category}\nSubject: ${subject}\n\n${message}`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error sending admin contact message:', error.message);
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
  }
});