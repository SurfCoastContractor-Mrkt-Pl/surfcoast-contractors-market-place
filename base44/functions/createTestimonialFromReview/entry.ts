import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    // Support entity automations or direct API calls
    let review_id = body.review_id;

    if (body.event) {
      // Called from entity automation
      review_id = body.event.entity_id;
    }

    if (!review_id) {
      return Response.json({ error: 'review_id required' }, { status: 400 });
    }

    // Only require auth for direct (non-automation) calls
    const isAutomation = !!body.event;
    if (!isAutomation) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json(
          { error: 'Authentication required' },
          { status: 401 }
        );
      }
    }

    // Get the review
    const reviews = await base44.entities.Review.filter({ id: review_id });
    if (!reviews || reviews.length === 0) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    const review = reviews[0];

    // Verify user is the review author (skip for automations)
    if (!isAutomation) {
      const user = await base44.auth.me();
      if (review.reviewer_email !== user.email) {
        return Response.json(
          { error: 'Unauthorized - only review author can convert to testimonial' },
          { status: 403 }
        );
      }
    }

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