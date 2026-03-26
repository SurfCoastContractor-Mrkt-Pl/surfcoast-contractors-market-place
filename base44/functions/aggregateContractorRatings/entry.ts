import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    // SECURITY: Only admins or automated systems can aggregate ratings
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      console.warn(`[AUTH_VIOLATION] Non-admin user ${user.email} attempted to trigger aggregateContractorRatings`);
      return Response.json(
        { error: 'Forbidden: Only admins or scheduled automations can aggregate ratings' },
        { status: 403 }
      );
    }

    // Batch aggregate all contractor ratings (daily scheduled task)
    const contractors = await base44.asServiceRole.entities.Contractor.list();

    if (!contractors || contractors.length === 0) {
      return Response.json({
        success: true,
        message: 'No contractors found',
        updated_count: 0,
        timestamp: new Date().toISOString(),
      });
    }

    let updatedCount = 0;
    const results = [];

    for (const contractor of contractors) {
      try {
        // Fetch all verified reviews for this contractor
        const reviews = await base44.asServiceRole.entities.Review.filter({
          contractor_id: contractor.id,
          verified: true
        });

        if (reviews && reviews.length > 0) {
          // Calculate average rating
          const totalRating = reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
          const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

          // Update contractor profile with rating
          await base44.asServiceRole.entities.Contractor.update(contractor.id, {
            rating: averageRating,
            reviews_count: reviews.length
          });

          updatedCount++;
          results.push({
            contractor_id: contractor.id,
            contractor_name: contractor.name,
            rating: averageRating,
            reviews_count: reviews.length
          });
        }
      } catch (error) {
        console.error(`[aggregateContractorRatings] Error processing contractor ${contractor.id}:`, error.message);
      }
    }

    console.log(`[aggregateContractorRatings] Completed: Updated ${updatedCount} contractors`);

    return Response.json({
      success: true,
      updated_count: updatedCount,
      total_contractors: contractors.length,
      timestamp: new Date().toISOString(),
      results: results.slice(0, 10) // Return sample of updated contractors
    });
  } catch (error) {
    console.error('[aggregateContractorRatings] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});