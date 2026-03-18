import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { shop_id, reviewer_name, reviewer_email, rating, review_title, review_body, shop_name } = await req.json();

    if (!shop_id || !reviewer_name || !reviewer_email || !rating || !review_title || !review_body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reviewer_email)) {
      return Response.json({ error: 'Invalid email format' }, { status: 400 });
    }

    if (![1, 2, 3, 4, 5].includes(rating)) {
      return Response.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    // Rate limit: max 10 reviews per IP per day
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || 'unknown';
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    try {
      const recentReviews = await base44.asServiceRole.entities.VendorReview.filter({
        created_date: { $gte: oneDayAgo }
      });
      const ipReviews = recentReviews?.filter(r => r.ip_address === ipAddress) || [];

      if (ipReviews.length >= 10) {
        return Response.json({ 
          error: 'Rate limit exceeded. Maximum 10 reviews per day.' 
        }, { status: 429 });
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