/**
 * notifyNewProjectMessage — triggered by entity automation on ProjectMessage create.
 * Sends an in-app notification (and email) to the OTHER party so they know to come back.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Helper: validate this is a legitimate platform automation payload
function isValidAutomationPayload(payload) {
  return payload?.event?.type && payload?.event?.entity_name && payload?.event?.entity_id;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();

    // Must be a legitimate platform automation — reject spoofed payloads
    if (!isValidAutomationPayload(payload)) {
      const serviceKey = req.headers.get('x-internal-key');
      if (!serviceKey || serviceKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    }

    const { event, data } = payload;

    if (!data || !data.scope_id) {
      return Response.json({ skipped: true, reason: 'no data or scope_id' });
    }

    const scope = await base44.asServiceRole.entities.ScopeOfWork.get(data.scope_id);
    if (!scope) {
      return Response.json({ skipped: true, reason: 'scope not found' });
    }

    const appUrl = Deno.env.get('APP_URL') || 'https://surfcoastcmp.com';

    // Determine recipient (the other party)
    let recipientEmail, recipientName, actionUrl;
    if (data.sender_type === 'contractor') {
      recipientEmail = scope.client_email;
      recipientName = scope.client_name;
      actionUrl = `${appUrl}/customer-portal`;
    } else {
      recipientEmail = scope.contractor_email;
      recipientName = scope.contractor_name;
      actionUrl = `${appUrl}/FieldOps`;
    }

    // Create in-app notification
    await base44.asServiceRole.entities.Notification.create({
      user_email: recipientEmail,
      title: `New message on "${scope.job_title}"`,
      description: `${data.sender_name}: "${(data.message || '').substring(0, 80)}${data.message?.length > 80 ? '...' : ''}"`,
      action_url: actionUrl,
      read: false,
      category: 'message',
    });

    // Also send a lightweight email nudge
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: recipientEmail,
      subject: `New message on "${scope.job_title}" from ${data.sender_name}`,
      body: `Hi ${recipientName},\n\n${data.sender_name} sent you a message:\n\n"${data.message || '(attachment)'}"\n\nReply here: ${actionUrl}\n\n— SurfCoast Marketplace`,
    });

    console.log(`[notifyNewProjectMessage] Notified ${recipientEmail} about message on scope ${data.scope_id}`);

    return Response.json({ success: true });
  } catch (error) {
    console.error('[notifyNewProjectMessage] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});