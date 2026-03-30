import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Helper to send emails via Base44 Core integration
 * @param {string} to - Recipient email
 * @param {string} subject - Email subject
 * @param {string} body - Email body (plain text)
 * @param {string} fromName - Optional sender name (defaults to app name)
 * @returns {Promise<void>}
 */
export async function sendEmail(base44, to, subject, body, fromName = null) {
  try {
    await base44.integrations.Core.SendEmail({
      to,
      subject,
      body,
      from_name: fromName,
    });
    console.log(`[EMAIL] Sent to ${to}`);
  } catch (error) {
    console.error(`[EMAIL-ERROR] Failed to send to ${to}:`, error.message);
    throw error;
  }
}

/**
 * Wrapper function for sendEmail that auto-initializes base44
 * Can be called from backend functions
 */
Deno.serve(async (req) => {
  const { to, subject, body, from_name } = await req.json();

  if (!to || !subject || !body) {
    return Response.json(
      { error: 'Missing required fields: to, subject, body' },
      { status: 400 }
    );
  }

  try {
    const base44 = createClientFromRequest(req);
    await sendEmail(base44, to, subject, body, from_name);
    return Response.json({ success: true, message: 'Email sent' });
  } catch (error) {
    console.error('[EMAIL-WRAPPER-ERROR]', error);
    return Response.json(
      { error: 'Failed to send email', details: error.message },
      { status: 500 }
    );
  }
});