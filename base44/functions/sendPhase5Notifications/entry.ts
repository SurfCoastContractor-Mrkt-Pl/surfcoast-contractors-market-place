import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const notificationTypes = {
  milestone_completed: {
    title: 'Milestone Completed',
    template: (data) => `${data.milestone_name} has been marked complete on ${data.scope_title}`,
  },
  file_uploaded: {
    title: 'File Uploaded',
    template: (data) => `${data.file_name} was added to ${data.scope_title}`,
  },
  budget_alert: {
    title: 'Budget Alert',
    template: (data) => `Project expenses have reached ${data.percentage}% of budget`,
  },
  expense_logged: {
    title: 'Expense Logged',
    template: (data) => `$${data.amount} expense logged: ${data.description}`,
  },
  message_sent: {
    title: 'New Message',
    template: (data) => `${data.sender_name} sent you a message on ${data.scope_title}`,
  },
  payment_due: {
    title: 'Payment Due',
    template: (data) => `Payment of $${data.amount} is due by ${data.due_date}`,
  },
};

async function createNotification(base44, scopeId, userEmail, type, data) {
  try {
    // Store notification in database
    await base44.entities.Notification?.create({
      scope_id: scopeId,
      user_email: userEmail,
      type,
      title: notificationTypes[type]?.title || type,
      message: notificationTypes[type]?.template(data) || 'New update',
      data,
      read: false,
      created_at: new Date().toISOString(),
    }).catch(() => null); // Silently fail if Notification entity doesn't exist
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
    }

    const { scope_id, user_email, notification_type, data } = await req.json();

    if (!scope_id || !user_email || !notification_type) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400 }
      );
    }

    await createNotification(base44, scope_id, user_email, notification_type, data);

    return new Response(
      JSON.stringify({ success: true, message: 'Notification sent' }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Notification error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});