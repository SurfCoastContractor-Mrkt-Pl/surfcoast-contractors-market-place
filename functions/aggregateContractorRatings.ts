import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Fetch all reviews
    const reviews = await base44.asServiceRole.entities.Review.list();
    
    // Group by contractor_id and calculate averages
    const ratingsByContractor = {};
    reviews.forEach(review => {
      if (review.verified && review.contractor_id) {
        if (!ratingsByContractor[review.contractor_id]) {
          ratingsByContractor[review.contractor_id] = { ratings: [], count: 0 };
        }
        ratingsByContractor[review.contractor_id].ratings.push(review.overall_rating);
        ratingsByContractor[review.contractor_id].count += 1;
      }
    });

    // Update contractor records
    let updated = 0;
    for (const [contractorId, data] of Object.entries(ratingsByContractor)) {
      const avgRating = data.ratings.reduce((a, b) => a + b, 0) / data.ratings.length;
      await base44.asServiceRole.entities.Contractor.update(contractorId, {
        rating: Math.round(avgRating * 10) / 10,
        reviews_count: data.count,
      });
      updated++;
    }

    return Response.json({ success: true, updated, totalReviews: reviews.length });
  } catch (error) {
    console.error('Rating aggregation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});