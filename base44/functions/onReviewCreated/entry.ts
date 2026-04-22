import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const payload = await req.json();
    const { event, data } = payload;

    // Only process create events with a contractor_id
    const contractor_id = data?.contractor_id || (
      event?.entity_id ? (await base44.asServiceRole.entities.Review.get(event.entity_id))?.contractor_id : null
    );

    if (!contractor_id) {
      console.log('[onReviewCreated] No contractor_id found, skipping');
      return Response.json({ success: true, skipped: true });
    }

    // Fetch all verified reviews for this contractor
    const reviews = await base44.asServiceRole.entities.Review.filter({
      contractor_id,
      verified: true,
    });

    if (!reviews || reviews.length === 0) {
      return Response.json({ success: true, message: 'No verified reviews yet' });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
    const averageRating = parseFloat((totalRating / reviews.length).toFixed(1));

    // Update contractor profile
    await base44.asServiceRole.entities.Contractor.update(contractor_id, {
      rating: averageRating,
      reviews_count: reviews.length,
    });

    console.log(`[onReviewCreated] Updated contractor ${contractor_id}: rating=${averageRating}, reviews=${reviews.length}`);
    return Response.json({ success: true, rating: averageRating, reviews_count: reviews.length });
  } catch (error) {
    console.error('[onReviewCreated] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});