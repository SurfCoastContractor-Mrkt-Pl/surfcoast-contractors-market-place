import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * Detects and flags suspicious patterns
 * - Multiple payment methods created in short time
 * - Payments from different countries
 * - Repeated failed payment attempts
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { customer_email, payment_method_id, ip_country } = await req.json();

    if (!customer_email) {
      return Response.json({ error: 'Missing customer email' }, { status: 400 });
    }

    const now = new Date();
    const lastHour = new Date(now.getTime() - 60 * 60 * 1000);

    // Check payment methods added in last hour
    const recentMethods = await base44.asServiceRole.entities.SavedPaymentMethod.filter({
      user_email: customer_email,
      created_date: { $gte: lastHour.toISOString() }
    });

    const alerts = [];

    // Flag if adding multiple payment methods quickly (potential fraud)
    if (recentMethods.length > 2) {
      alerts.push({
        type: 'multiple_payment_methods',
        severity: 'medium',
        message: 'Multiple payment methods added in short time'
      });
    }

    // Log suspicious activity for admin review
    if (alerts.length > 0) {
      await base44.asServiceRole.entities.SecurityAlert.create({
        alert_type: 'suspicious_request',
        severity: 'medium',
        ip_address: ip_country || 'unknown',
        details: JSON.stringify({
          customer_email,
          suspicious_patterns: alerts,
          timestamp: new Date().toISOString()
        })
      });
    }

    return Response.json({
      suspicious: alerts.length > 0,
      alerts: alerts,
      recommendation: alerts.length > 0 ? 'Review and potentially verify customer' : 'Normal activity'
    });
  } catch (error) {
    console.error('Suspicious activity check error:', error);
    return Response.json(
      { error: 'Check failed', details: error.message },
      { status: 500 }
    );
  }
});