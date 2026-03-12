import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { review_id } = await req.json();

    if (!review_id) {
      return Response.json({ error: 'review_id required' }, { status: 400 });
    }

    // Get the review
    const reviews = await base44.entities.Review.filter({ id: review_id });
    if (!reviews || reviews.length === 0) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    const review = reviews[0];

    // Check if already a testimony
    if (review.is_testimony) {
      return Response.json({ already_testimony: true });
    }

    // Update review to mark as testimony (public testimonial)
    if (review.overall_rating >= 4 && review.comment && review.comment.length > 30) {
      await base44.entities.Review.update(review_id, {
        is_testimony: true
      });

      return Response.json({ 
        success: true, 
        message: 'Review converted to testimonial' 
      });
    } else {
      return Response.json({ 
        not_eligible: true,
        reason: 'Review must be 4+ stars with substantive comment' 
      });
    }
  } catch (error) {
    console.error('Create testimonial error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});