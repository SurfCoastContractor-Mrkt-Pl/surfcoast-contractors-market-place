import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json().catch(() => ({}));

    const isAutomation = !!body.event;
    let review_id;
    let review = null;

    if (isAutomation) {
      // Extract from automation event; prefer inline data to avoid extra fetch
      review_id = body.event?.entity_id;
      if (body.data) review = body.data;
    } else {
      // Direct API call — require admin or review author
      review_id = body.review_id;
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    if (!review_id) {
      console.error('[createTestimonialFromReview] Missing review_id. body.event:', JSON.stringify(body.event));
      return Response.json({ error: 'review_id required' }, { status: 400 });
    }

    // Fetch review if not already in payload (use service role for automations)
    if (!review) {
      review = await base44.asServiceRole.entities.Review.get(review_id);
    }

    if (!review) {
      return Response.json({ error: 'Review not found' }, { status: 404 });
    }

    // Check if already a testimony
    if (review.is_testimony) {
      return Response.json({ already_testimony: true });
    }

    // Convert if eligible: 4+ stars with substantive comment
    if (review.overall_rating >= 4 && review.comment && review.comment.length > 30) {
      await base44.asServiceRole.entities.Review.update(review_id, {
        is_testimony: true
      });

      console.log(`[createTestimonialFromReview] Converted review ${review_id} to testimonial`);
      return Response.json({ success: true, message: 'Review converted to testimonial' });
    } else {
      return Response.json({ not_eligible: true, reason: 'Review must be 4+ stars with substantive comment' });
    }
  } catch (error) {
    console.error('[createTestimonialFromReview] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});