/**
 * Sync Completed Jobs Count
 * Hourly cron job to sync contractor.completed_jobs_count with actual closed scopes
 * Fixes data integrity issue where counts get out of sync
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all contractors
    const contractors = await base44.asServiceRole.entities.Contractor.list();
    let syncedCount = 0;
    let correctedCount = 0;

    for (const contractor of contractors) {
      // Count actual closed scopes for this contractor
      const closedScopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
        contractor_email: contractor.email,
        status: 'closed'
      });

      const actualCount = closedScopes.length;

      // Update if count is out of sync
      if (contractor.completed_jobs_count !== actualCount) {
        await base44.asServiceRole.entities.Contractor.update(contractor.id, {
          completed_jobs_count: actualCount
        });
        correctedCount++;
        console.log(`Corrected ${contractor.email}: ${contractor.completed_jobs_count} → ${actualCount}`);
      }

      syncedCount++;
    }

    console.log(`Sync completed: ${syncedCount} contractors processed, ${correctedCount} corrected`);

    return Response.json({ 
      success: true,
      contractors_processed: syncedCount,
      corrections_made: correctedCount
    });
  } catch (error) {
    console.error('syncCompletedJobsCount error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});