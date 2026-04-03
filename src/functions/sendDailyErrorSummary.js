import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL') || 'admin@surfcoast.io';
    
    // Get errors from the past 24 hours
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const today = new Date().toISOString();
    
    // Since we can't query by date range directly, we'd fetch all and filter
    // In production, you'd want indexed date queries
    const allErrors = await base44.asServiceRole.entities.ErrorLog.list('', 1000);
    
    const recentErrors = allErrors.filter(e => 
      new Date(e.data.timestamp) > new Date(yesterday)
    );
    
    // Aggregate statistics
    const stats = {
      total: recentErrors.length,
      critical: recentErrors.filter(e => e.data.severity === 'critical').length,
      high: recentErrors.filter(e => e.data.severity === 'high').length,
      medium: recentErrors.filter(e => e.data.severity === 'medium').length,
      low: recentErrors.filter(e => e.data.severity === 'low').length,
      resolved: recentErrors.filter(e => e.data.isResolved).length,
      unresolved: recentErrors.filter(e => !e.data.isResolved).length,
      uniqueUsers: new Set(recentErrors.map(e => e.data.userEmail)).size
    };
    
    // Build email body
    const emailBody = `
Daily Platform Error Summary
Generated: ${new Date().toLocaleString()}

STATISTICS (Past 24 Hours)
Total Errors: ${stats.total}
Critical: ${stats.critical} 🔴
High: ${stats.high} 🟠
Medium: ${stats.medium} 🟡
Low: ${stats.low} 🔵

Status:
Resolved: ${stats.resolved}
Unresolved: ${stats.unresolved}
Unique Users Affected: ${stats.uniqueUsers}

${stats.critical > 0 ? `
⚠️ CRITICAL ISSUES REQUIRING IMMEDIATE ATTENTION
${recentErrors.filter(e => e.data.severity === 'critical').slice(0, 5).map(e => `  - ${e.data.pageOrFeature}: ${e.data.errorMessage}`).join('\n')}
` : '✅ No critical errors'}

View full error logs in the Admin Error Logs panel.
    `.trim();
    
    try {
      await base44.integrations.Core.SendEmail({
        to: adminEmail,
        subject: `📊 Daily Platform Error Summary - ${stats.total} errors`,
        body: emailBody
      });
    } catch (emailError) {
      console.error('Failed to send daily summary email:', emailError.message);
    }
    
    return Response.json({ success: true, stats });
  } catch (error) {
    console.error('Error in sendDailyErrorSummary:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});