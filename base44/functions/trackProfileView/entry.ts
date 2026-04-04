/**
 * trackProfileView — increments a contractor's profile view counter.
 * Called from ContractorPublicProfile on mount.
 * Stores views in a simple field on the Contractor entity.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractor_id } = await req.json();

    if (!contractor_id) {
      return Response.json({ error: 'contractor_id is required' }, { status: 400 });
    }

    const contractor = await base44.asServiceRole.entities.Contractor.get(contractor_id);
    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const currentViews = contractor.profile_views || 0;
    const currentWeekViews = contractor.profile_views_this_week || 0;
    const lastReset = contractor.profile_views_week_reset;
    
    // Reset weekly counter if it's been 7+ days
    const now = new Date();
    const resetDate = lastReset ? new Date(lastReset) : null;
    const daysSinceReset = resetDate ? (now - resetDate) / (1000 * 60 * 60 * 24) : 999;
    
    const newWeekViews = daysSinceReset >= 7 ? 1 : currentWeekViews + 1;
    const weekReset = daysSinceReset >= 7 ? now.toISOString() : lastReset;

    await base44.asServiceRole.entities.Contractor.update(contractor_id, {
      profile_views: currentViews + 1,
      profile_views_this_week: newWeekViews,
      profile_views_week_reset: weekReset || now.toISOString(),
    });

    console.log(`[trackProfileView] contractor ${contractor_id} — total: ${currentViews + 1}, this week: ${newWeekViews}`);

    return Response.json({ success: true, total_views: currentViews + 1, week_views: newWeekViews });
  } catch (error) {
    console.error('[trackProfileView] error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});