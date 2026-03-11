import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Rate limiter per IP/email
const requestCounts = new Map();
const RATE_LIMIT_WINDOW = 3600000; // 1 hour
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

    // Rate limiting per user
    const now = Date.now();
    const userKey = user.email;
    if (!requestCounts.has(userKey)) {
      requestCounts.set(userKey, []);
    }

    const userRequests = requestCounts.get(userKey);
    const recentRequests = userRequests.filter(timestamp => now - timestamp < RATE_LIMIT_WINDOW);
    
    if (recentRequests.length >= RATE_LIMIT_THRESHOLD) {
      return Response.json({ error: 'Rate limit exceeded: maximum 5 messages per hour' }, { status: 429 });
    }

    recentRequests.push(now);
    requestCounts.set(userKey, recentRequests);

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
    console.error('Error sending admin contact message');
    return Response.json({ error: 'Failed to send message' }, { status: 500 });
    }
});