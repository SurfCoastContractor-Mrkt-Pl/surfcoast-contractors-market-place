/**
 * Send Notification Asynchronously
 * Queues notifications instead of blocking main thread
 * Useful for emails, SMS, push notifications
 */
/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// In-memory queue (in production, use Redis or RabbitMQ)
const notificationQueue = [];
let isProcessing = false;

const processQueue = async () => {
  if (isProcessing || notificationQueue.length === 0) return;
  isProcessing = true;

  while (notificationQueue.length > 0) {
    const notification = notificationQueue.shift();
    try {
      await sendNotification(notification);
      console.log(`Notification sent: ${notification.id}`);
    } catch (error) {
      console.error(`Failed to send notification ${notification.id}: ${error.message}`);
      // Re-queue for retry (max 3 times)
      if ((notification.retryCount || 0) < 3) {
        notification.retryCount = (notification.retryCount || 0) + 1;
        notificationQueue.push(notification);
      }
    }
  }

  isProcessing = false;
};

const sendNotification = async (notification) => {
  const { type, to, subject, body } = notification;

  if (type === 'email') {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('SENDGRID_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: to }] }],
        from: { email: Deno.env.get('SENDER_EMAIL') },
        subject,
        content: [{ type: 'text/plain', value: body }]
      })
    });

    if (!response.ok) {
      throw new Error(`Email send failed: ${response.status}`);
    }
  }
};

/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { type, to, subject, body, id } = await req.json();

    if (!type || !to) {
      return Response.json({ error: 'type and to required' }, { status: 400 });
    }

    // Add to queue (non-blocking)
    const notification = {
      id: id || `notif-${Date.now()}`,
      type,
      to,
      subject,
      body,
      retryCount: 0,
      queuedAt: new Date().toISOString()
    };

    notificationQueue.push(notification);

    // Process queue asynchronously (don't wait)
    processQueue().catch(err => console.error('Queue processing error:', err));

    console.log(`Notification queued: ${notification.id}`);

    return Response.json({ 
      success: true,
      message: 'Notification queued',
      notification_id: notification.id,
      queue_length: notificationQueue.length
    });
  } catch (error) {
    console.error('sendNotificationAsync error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});