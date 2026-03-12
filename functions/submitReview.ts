import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);

    // Must be authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized. You must be logged in to submit a review.' }, { status: 401 });
    }

    const body = await req.json();
    const { contractor_id, contractor_name, overall_rating, comment, is_testimony, quality_rating, punctuality_rating, communication_rating, professionalism_rating } = body;

    // Validate required fields
    if (!overall_rating || !comment) {
      return Response.json({ error: 'Missing required fields: overall_rating and comment required.' }, { status: 400 });
    }

    // Rate limiting: max 5 reviews per hour per user
    const REVIEW_RATE_LIMIT = 5;
    const REVIEW_WINDOW = 3600; // 1 hour in seconds
    const now = new Date();
    const windowStart = new Date(now.getTime() - REVIEW_WINDOW * 1000);

    try {
      const userReviewActivity = await base44.asServiceRole.entities.RateLimitTracker.filter({
        key: user.email,
        limit_type: 'review_submission',
        window_start: { '$gte': windowStart.toISOString() }
      });

      if (userReviewActivity.length > 0 && userReviewActivity[0].request_count >= REVIEW_RATE_LIMIT) {
        return Response.json({
          error: 'Review submission rate limit exceeded. Maximum 5 reviews per hour.'
        }, { status: 429 });
      }

      // Update or create rate limit record
      if (userReviewActivity.length > 0) {
        await base44.asServiceRole.entities.RateLimitTracker.update(userReviewActivity[0].id, {
          request_count: userReviewActivity[0].request_count + 1
        });
      } else {
        await base44.asServiceRole.entities.RateLimitTracker.create({
          key: user.email,
          limit_type: 'review_submission',
          request_count: 1,
          window_start: now.toISOString(),
          window_duration_seconds: REVIEW_WINDOW
        });
      }
    } catch (rateLimitError) {
      console.error('Review rate limit check failed:', rateLimitError.message);
    }

    // For non-testimony reviews, contractor_id is required
    if (!is_testimony && !contractor_id) {
      return Response.json({ error: 'contractor_id required for verified reviews.' }, { status: 400 });
    }

    // Validate ratings are in range 1-5
    if (overall_rating < 1 || overall_rating > 5) {
      return Response.json({ error: 'overall_rating must be between 1 and 5.' }, { status: 400 });
    }

    // For non-testimony reviews: verify closed scope with contractor
    if (!is_testimony && contractor_id) {
      let closedScopes = [];
      try {
        closedScopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
          contractor_id,
          customer_email: user.email,
          status: 'closed',
        });
      } catch (e) {
        console.error('Error checking scopes:', e.message);
      }

      if (!closedScopes || closedScopes.length === 0) {
        return Response.json({
          error: 'You can only leave a verified review after completing a job with this contractor.'
        }, { status: 403 });
      }

      // Check for duplicate review from this user for this contractor
      let existing = [];
      try {
        existing = await base44.asServiceRole.entities.Review.filter({
          contractor_id,
          reviewer_email: user.email,
        });
      } catch (e) {
        console.error('Error checking existing reviews:', e.message);
      }

      if (existing && existing.length > 0) {
        return Response.json({
          error: 'You have already submitted a review for this contractor.'
        }, { status: 409 });
      }
    }

    // Create the review
    let review;
    try {
      review = await base44.asServiceRole.entities.Review.create({
        contractor_id: contractor_id || null,
        contractor_name: contractor_name || 'Anonymous',
        reviewer_name: user.full_name || user.email,
        reviewer_email: user.email,
        reviewer_type: 'customer',
        overall_rating,
        quality_rating: quality_rating || overall_rating,
        punctuality_rating: punctuality_rating || overall_rating,
        communication_rating: communication_rating || overall_rating,
        professionalism_rating: professionalism_rating || overall_rating,
        comment,
        is_testimony: is_testimony || false,
        verified: !is_testimony, // Auto-verify testimonials
      });
    } catch (createError) {
      console.error('Error creating review:', createError.message);
      return Response.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return Response.json({ success: true, review });
  } catch (error) {
    console.error('submitReview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});