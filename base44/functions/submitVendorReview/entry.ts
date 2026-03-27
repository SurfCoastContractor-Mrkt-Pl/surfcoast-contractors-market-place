import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Must be authenticated — prevents anonymous spam reviews
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized: must be logged in to submit a review' }, { status: 401 });
    }

    const { shop_id, reviewer_name, reviewer_email, rating, review_title, review_body, shop_name } = await req.json();

    if (!shop_id || !reviewer_name || !reviewer_email || !rating || !review_title || !review_body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewer_email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    // Prevent spoofing — reviewer_email must match authenticated user
    if (reviewer_email.toLowerCase() !== user.email.toLowerCase()) {
      return Response.json({ error: 'Forbidden: reviewer email must match your account' }, { status: 403 });
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
      return Response.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    // Rate limit: max 10 reviews per IP per day (database-backed)
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const now = new Date().toISOString();
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const records = await base44.asServiceRole.entities.RateLimitTracker.filter({
        key: `vendor_review:${ipAddress}`,
        window_start: { $gte: oneDayAgo }
      });

      if (records && records.length > 0) {
        const record = records[0];
        if (record.request_count >= 10) {
          return Response.json({ 
            error: 'Rate limit exceeded. Maximum 10 reviews per day.' 
          }, { status: 429 });
        }
        await base44.asServiceRole.entities.RateLimitTracker.update(record.id, {
          request_count: record.request_count + 1
        });
      } else {
        await base44.asServiceRole.entities.RateLimitTracker.create({
          key: `vendor_review:${ipAddress}`,
          limit_type: 'vendor_review',
          request_count: 1,
          window_start: now,
          window_duration_seconds: 86400
        });
      }
    } catch (e) {
      console.warn('Rate limit check failed:', e.message);
    }

    // Create review in moderation queue (unverified by default)
    const review = await base44.asServiceRole.entities.VendorReview.create({
      shop_id,
      reviewer_name,
      reviewer_email,
      rating,
      review_title,
      review_body,
      shop_name,
      ip_address: ipAddress,
      verified: false, // Requires moderation
      status: 'pending_moderation'
    });

    console.log(`New vendor review submitted for moderation: ${shop_name} from ${reviewer_name} (${rating} stars) - Review ID: ${review.id}`);

    return Response.json({ 
      success: true, 
      message: 'Review submitted successfully. It will appear after moderation.',
      review_id: review.id
    });
  } catch (err) {
    console.error('Error in submitVendorReview:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});