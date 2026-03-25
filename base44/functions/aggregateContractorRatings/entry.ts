import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const { contractor_id } = await req.json();

    if (!contractor_id) {
      return Response.json({ error: 'contractor_id required' }, { status: 400 });
    }

    // Fetch all reviews for this contractor
    const reviews = await base44.asServiceRole.entities.Review.filter({
      contractor_id: contractor_id,
      verified: true
    });

    if (!reviews || reviews.length === 0) {
      return Response.json({
        contractor_id,
        rating: null,
        reviews_count: 0,
        reviews: []
      });
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0);
    const averageRating = totalRating / reviews.length;

    // Update contractor profile with rating
    await base44.asServiceRole.entities.Contractor.update(contractor_id, {
      rating: parseFloat(averageRating.toFixed(1)),
      reviews_count: reviews.length
    });

    return Response.json({
      contractor_id,
      rating: parseFloat(averageRating.toFixed(1)),
      reviews_count: reviews.length,
      reviews: reviews.slice(0, 10)
    });
  } catch (error) {
    console.error('Error aggregating contractor ratings:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});