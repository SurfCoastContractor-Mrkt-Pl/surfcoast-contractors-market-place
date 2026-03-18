import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const { shop_id, reviewer_name, rating, review_title, review_body, vendor_email, vendor_name, shop_name } = await req.json();

    if (!shop_id || !reviewer_name || !rating || !review_title || !review_body) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Log the review submission for admin notification
    console.log(`New vendor review submitted: ${shop_name} from ${reviewer_name} (${rating} stars)`);

    return Response.json({ success: true, message: 'Review submitted successfully' });
  } catch (err) {
    console.error('Error in submitVendorReview:', err);
    return Response.json({ error: err.message }, { status: 500 });
  }
});