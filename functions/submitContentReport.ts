import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();
    const {
      content_type,
      violation_category,
      target_user_email,
      target_user_name,
      content_id,
      content_preview,
      reason,
      evidence_urls = [],
    } = payload;

    // Validate required fields
    if (
      !content_type ||
      !violation_category ||
      !target_user_email ||
      !target_user_name
    ) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Scan content for violations
    const scanResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation expert. Analyze the following reported content for policy violations:

Content Type: ${content_type}
Reported Category: ${violation_category}
Reason for Report: ${reason || 'Not specified'}
Content Preview: "${content_preview || 'No preview provided'}"

Check for:
1. Illegal activities (drug trafficking, human trafficking, weapons, etc.)
2. Harassment, threats, or violence
3. Hate speech or discrimination
4. Scams, fraud, or deceptive practices
5. Unsafe or exploitative services
6. Extreme or graphic content

Respond in JSON with:
- risk_score (0-100): How serious is the violation?
- violations (array): List any detected violations
- recommended_severity (low/medium/high/critical): Severity level

Be thorough and conservative in flagging potential illegal activity.`,
      response_json_schema: {
        type: 'object',
        properties: {
          risk_score: { type: 'number' },
          violations: { type: 'array', items: { type: 'string' } },
          recommended_severity: { type: 'string' },
        },
      },
    });

    // Create the report record
    const report = await base44.entities.ContentReport.create({
      reporter_email: user.email,
      reporter_name: user.full_name,
      content_type,
      violation_category,
      target_user_email,
      target_user_name,
      content_id: content_id || null,
      content_preview: content_preview || null,
      reason: reason || null,
      ai_flagged: scanResult.risk_score > 40,
      ai_risk_score: scanResult.risk_score,
      ai_violations: scanResult.violations || [],
      status: scanResult.risk_score > 70 ? 'escalated' : 'new',
      severity: scanResult.recommended_severity || 'medium',
      evidence_urls: evidence_urls || [],
    });

    // If high risk, notify admin
    if (scanResult.risk_score > 70) {
      const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
      if (adminEmail) {
        try {
          await base44.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `⚠️ HIGH PRIORITY: Content Report Escalated (Risk: ${scanResult.risk_score})`,
            body: `A content report has been escalated due to high risk score.

Report ID: ${report.id}
Risk Score: ${scanResult.risk_score}/100
Severity: ${scanResult.recommended_severity}
Violations: ${(scanResult.violations || []).join(', ')}

Reported User: ${target_user_name} (${target_user_email})
Content Type: ${content_type}
Violation Category: ${violation_category}

Reason: ${reason || 'User report'}

Please review immediately in the admin dashboard.`,
          });
        } catch (emailError) {
          console.error('Failed to send admin alert:', emailError);
        }
      }
    }

    return Response.json({
      success: true,
      report_id: report.id,
      risk_score: scanResult.risk_score,
      status: report.status,
    });
  } catch (error) {
    console.error('Error submitting content report:', error);
    return Response.json(
      { error: 'Failed to submit report', details: error.message },
      { status: 500 }
    );
  }
});