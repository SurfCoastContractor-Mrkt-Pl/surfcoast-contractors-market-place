import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const { severity, testType } = await req.json();

    if (!severity || !testType) {
      return Response.json({ error: 'Severity and testType are required' }, { status: 400 });
    }

    // Create an error log entry
    const errorLog = await base44.asServiceRole.entities.ErrorLog.create({
      message: `Simulated ${severity} test error: ${testType} issue`,
      level: severity,
      category: testType,
      stack: `Simulated stack trace for ${testType} error at ${new Date().toISOString()}`,
      context: {
        testOrigin: 'PlatformTestsPage',
        simulatedImpact: `Testing ${severity} alert for ${testType}`
      },
      url: req.url,
      user_agent: req.headers.get('user-agent') || 'unknown',
      resolved: false
    });

    // Send admin alert email for high/critical errors
    if ((severity === 'critical' || severity === 'high') && Deno.env.get("ADMIN_ALERT_EMAIL")) {
      try {
        await base44.integrations.Core.SendEmail({
          to: Deno.env.get("ADMIN_ALERT_EMAIL"),
          subject: `[TEST ${severity.toUpperCase()}] Simulated ${testType} Error`,
          body: `A test error has been triggered.\n\nSeverity: ${severity}\nType: ${testType}\nTime: ${new Date().toLocaleString()}`
        });
      } catch (emailError) {
        console.log('Email notification skipped:', emailError.message);
      }
    }

    return Response.json({ 
      status: 'success', 
      message: `Simulated ${severity} error (${testType}) logged successfully.`,
      errorId: errorLog.id
    });
  } catch (error) {
    console.error('Error in triggerTestError:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});