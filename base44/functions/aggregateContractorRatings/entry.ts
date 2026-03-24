import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all reviews
    const reviews = await base44.asServiceRole.entities.Review.list();
    
    // Fetch all closed scopes to compute job counts and unique customers
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ status: 'closed' });

    // Build per-contractor maps: total closed jobs and unique customer emails
    const jobsByContractor = {};
    scopes.forEach(scope => {
      if (!scope.contractor_id) return;
      if (!jobsByContractor[scope.contractor_id]) {
        jobsByContractor[scope.contractor_id] = { totalJobs: 0, customerEmails: new Set() };
      }
      jobsByContractor[scope.contractor_id].totalJobs += 1;
      if (scope.customer_email) {
        jobsByContractor[scope.contractor_id].customerEmails.add(scope.customer_email.toLowerCase());
      }
    });

    // Group reviews by contractor_id and calculate averages
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

    // Collect all contractor IDs to update
    const allContractorIds = new Set([
      ...Object.keys(ratingsByContractor),
      ...Object.keys(jobsByContractor),
    ]);

    // Update contractor records
    let updated = 0;
    for (const contractorId of allContractorIds) {
      const ratingData = ratingsByContractor[contractorId];
      const jobData = jobsByContractor[contractorId];

      const updatePayload = {};
      if (ratingData) {
        const avgRating = ratingData.ratings.reduce((a, b) => a + b, 0) / ratingData.ratings.length;
        updatePayload.rating = Math.round(avgRating * 10) / 10;
        updatePayload.reviews_count = ratingData.count;
      }
      if (jobData) {
        updatePayload.completed_jobs_count = jobData.totalJobs;
        updatePayload.unique_customers_count = jobData.customerEmails.size;
      }

      await base44.asServiceRole.entities.Contractor.update(contractorId, updatePayload);
      updated++;
    }

    return Response.json({ success: true, updated, totalReviews: reviews.length });
  } catch (error) {
    console.error('Rating aggregation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});