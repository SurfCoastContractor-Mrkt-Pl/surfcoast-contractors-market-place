import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scope_id, document_type, file_url, recipient_email, message } = await req.json();

    if (!recipient_email || !document_type) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let signedUrl = file_url;
    if (file_url && file_url.includes('private')) {
      try {
        const signed = await base44.integrations.Core.CreateFileSignedUrl({
          file_uri: file_url,
          expires_in: 86400, // 24 hours
        });
        signedUrl = signed.signed_url;
      } catch (err) {
        console.error('Failed to sign URL:', err);
      }
    }

    const documentLabels = {
      after_photo: 'After Photos',
      contract: 'Signed Contract',
      invoice: 'Invoice',
      receipt: 'Receipt',
      permit: 'Permit Documentation',
      estimate: 'Project Estimate',
    };

    const emailBody = `
Hello,

A new document has been added to your project: ${documentLabels[document_type] || document_type}

${message ? `**Note:** ${message}` : ''}

${signedUrl ? `**View Document:** ${signedUrl}` : 'Document link will expire in 24 hours.'}

This document is required for project completion. Please review and take any necessary action.

This is a transactional notification. Please do not reply to this email.

Best regards,
Wave FO
    `;

    await base44.integrations.Core.SendEmail({
      to: recipient_email,
      subject: `Document Alert: ${documentLabels[document_type] || document_type}`,
      body: emailBody,
      from_name: 'Wave FO',
    });

    return Response.json({ success: true, message: 'Document alert sent' });
  } catch (error) {
    console.error('Document alert error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});