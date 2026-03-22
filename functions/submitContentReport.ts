import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed', requestId }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Rate limiting: max 5 reports per user per hour
    try {
      const now = new Date().toISOString();
      const hourAgo = new Date(Date.now() - 3600000).toISOString();
      const recentReports = await base44.asServiceRole.entities.ContentReport.filter(
        { reporter_email: user.email, created_date: { $gte: hourAgo } }
      );
      
      if (recentReports && recentReports.length >= 5) {
        return Response.json(
          { error: 'Rate limited: Maximum 5 reports per hour' },
          { status: 429 }
        );
      }
    } catch (limitError) {
      console.warn('Rate limit check failed, proceeding:', limitError.message);
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

    // Validate evidence URLs (prevent SSRF)
    const allowedDomainsEnv = Deno.env.get('ALLOWED_EVIDENCE_DOMAINS');
    if (!allowedDomainsEnv) {
      console.warn('ALLOWED_EVIDENCE_DOMAINS not configured — all evidence URLs will be rejected');
    }
    const allowedDomains = allowedDomainsEnv ? allowedDomainsEnv.split(',').map(d => d.trim()).filter(Boolean) : [];
    const validatedUrls = [];
    for (const url of evidence_urls) {
      try {
        const urlObj = new URL(url);
        const isAllowed = allowedDomains.some(domain => urlObj.hostname.endsWith(domain));
        if (isAllowed) {
          validatedUrls.push(url);
        } else {
          console.warn(`Rejected evidence URL from unauthorized domain: ${urlObj.hostname}`);
        }
      } catch {
        console.warn(`Invalid evidence URL provided: ${url}`);
      }
    }

    // SECURITY: Sanitize user inputs to prevent prompt injection
    const sanitizeInput = (text) => {
      if (!text) return '';
      // Remove control characters and limit length
      return text.replace(/[\x00-\x1F\x7F]/g, '').substring(0, 500);
    };

    const sanitizedPreview = sanitizeInput(content_preview);
    const sanitizedReason = sanitizeInput(reason);

    // Scan content for violations
    const scanResult = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a content moderation expert. Analyze the following reported content for policy violations.

Content Type: ${content_type}
Reported Category: ${violation_category}
Reason for Report: ${sanitizedReason || 'Not specified'}
Content Preview: "${sanitizedPreview || 'No preview provided'}"

Check for:
1. Illegal activities (drug trafficking, human trafficking, weapons, etc.)
2. Harassment, threats, or violence
3. Hate speech or discrimination
4. Scams, fraud, or deceptive practices
5. Unsafe or exploitative services
6. Extreme or graphic content

Respond ONLY with valid JSON containing:
- risk_score (0-100)
- violations (array of strings)
- recommended_severity (one of: low, medium, high, critical)

Do not include any explanations or additional text outside the JSON object.`,
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
      evidence_urls: validatedUrls,
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
      status: report.status,
    });
  } catch (error) {
    console.error(`[${requestId}] Error submitting content report:`, error.message);
    return Response.json(
      { error: 'Failed to submit report', requestId },
      { status: 500 }
    );
  }
});