import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
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

    // For non-testimony reviews, contractor_id is required
    if (!is_testimony && !contractor_id) {
      return Response.json({ error: 'contractor_id required for verified reviews.' }, { status: 400 });
    }

    // Validate ratings are in range 1-5
    if (overall_rating < 1 || overall_rating > 5) {
      return Response.json({ error: 'overall_rating must be between 1 and 5.' }, { status: 400 });
    }

    // Enforce: user must have a closed ScopeOfWork with this contractor
    const closedScopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
      contractor_id,
      customer_email: user.email,
      status: 'closed',
    });

    if (!closedScopes || closedScopes.length === 0) {
      return Response.json({
        error: 'You can only leave a review or testimony after completing a verified job with this contractor.'
      }, { status: 403 });
    }

    // Check for duplicate review from this user for this contractor
    const existing = await base44.asServiceRole.entities.Review.filter({
      contractor_id,
      reviewer_email: user.email,
    });

    if (existing && existing.length > 0) {
      return Response.json({
        error: 'You have already submitted a review for this contractor.'
      }, { status: 409 });
    }

    // Create the review
    const review = await base44.asServiceRole.entities.Review.create({
      contractor_id,
      contractor_name,
      reviewer_name: user.full_name,
      reviewer_email: user.email,
      reviewer_type: 'customer',
      overall_rating,
      comment,
      is_testimony: is_testimony || false,
      verified: false,
    });

    return Response.json({ success: true, review });
  } catch (error) {
    console.error('submitReview error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});