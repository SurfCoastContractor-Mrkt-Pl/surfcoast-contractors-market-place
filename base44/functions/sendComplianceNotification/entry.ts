import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // SECURITY: Validate internal service key for scheduled automation
    const serviceKey = req.headers.get('x-service-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!serviceKey || !expectedKey || serviceKey !== expectedKey) {
      const user = await base44.auth.me();
      if (!user || user.role !== 'admin') {
        console.warn(`[AUTH_VIOLATION] Unauthorized access attempt to sendComplianceNotification`);
        return Response.json(
          { error: 'Forbidden: Only admins or scheduled automations can send compliance notifications' },
          { status: 403 }
        );
      }
    }
    
    const { contractor_id, violation_type, grace_until } = await req.json();

    if (!contractor_id || !violation_type) {
      return Response.json(
        { error: 'Missing required fields: contractor_id, violation_type' },
        { status: 400 }
      );
    }

    let contractor = null;
    try {
      contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);
    } catch (e) {
      console.warn('Contractor not found or invalid ID:', contractor_id);
      return Response.json({ success: true, message: 'Contractor not found — notification skipped' }, { status: 200 });
    }

    if (!contractor) {
      return Response.json({ success: true, message: 'Contractor not found — notification skipped' }, { status: 200 });
    }

    const emailSubjects = {
      payment_compliance: '⚠️ Payment Compliance Alert - SurfCoast',
      minor_hours: '⚠️ Minor Hours Limit Exceeded - SurfCoast',
      after_photo: '⚠️ After-Photo Deadline Missed - SurfCoast',
      appeal_approved: '✅ Your Appeal Has Been Approved - SurfCoast',
      appeal_rejected: '❌ Your Appeal Was Not Approved - SurfCoast',
    };

    const emailBodies = {
      payment_compliance: `
        Hi ${contractor.name},

        We detected off-platform payment keywords in your recent messages. To maintain platform integrity, all payments must be processed through SurfCoast.

        You have 14 days to ensure all future payments go through our platform. After this grace period, your account may be restricted.

        Grace period until: ${grace_until ? new Date(grace_until).toLocaleDateString() : 'N/A'}

        If you have questions, please submit a compliance appeal with an explanation.

        - SurfCoast Team
      `,
      minor_hours: `
        Hi ${contractor.name},

        Your account has been locked because you reached the 20-hour weekly work limit for minor contractors. This is in accordance with labor laws to protect young workers.

        Your account will automatically unlock in 7 days.

        If you believe this is an error, please submit a compliance appeal.

        - SurfCoast Team
      `,
      after_photo: `
        Hi ${contractor.name},

        Your account has been locked because you did not submit after photos within 72 hours of the agreed work date. After photos are required to complete and verify job scope.

        Please submit a compliance appeal with the missing photos to unlock your account.

        - SurfCoast Team
      `,
      appeal_approved: `
        Hi ${contractor.name},

        Great news! Your compliance appeal has been approved by our admin team. Your account has been unlocked and you can resume normal operations.

        Thank you for your cooperation.

        - SurfCoast Team
      `,
      appeal_rejected: `
        Hi ${contractor.name},

        Your compliance appeal has been reviewed and was not approved at this time. Please review the admin's notes and consider resubmitting with additional evidence if appropriate.

        - SurfCoast Team
      `,
    };

    await base44.integrations.Core.SendEmail({
      to: contractor.email,
      subject: emailSubjects[violation_type],
      body: emailBodies[violation_type],
    });

    console.log(
      `[COMPLIANCE_NOTIFICATION] Email sent to ${contractor.email} for ${violation_type}`
    );

    return Response.json({
      success: true,
      email_sent_to: contractor.email,
      violation_type: violation_type,
    });
  } catch (error) {
    console.error('[COMPLIANCE_NOTIFICATION_ERROR]', error.message);
    return Response.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
});