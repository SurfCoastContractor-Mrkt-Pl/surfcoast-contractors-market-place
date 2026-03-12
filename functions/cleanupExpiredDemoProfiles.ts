import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    // Allow admin or service role
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const now = new Date().toISOString();

    // Find all expired demo contractors
    const expiredContractors = await base44.asServiceRole.entities.Contractor.filter({
      is_demo: true,
      demo_expires_at: { $lte: now }
    });

    // Find all expired demo customers
    const expiredCustomers = await base44.asServiceRole.entities.CustomerProfile.filter({
      is_demo: true,
      demo_expires_at: { $lte: now }
    });

    let contractorsDeleted = 0;
    let customersDeleted = 0;
    let reviewsDeleted = 0;
    let errors = [];

    // Delete expired contractors and their related data
    for (const contractor of expiredContractors) {
      try {
        // Delete all reviews for this contractor
        const contractorReviews = await base44.asServiceRole.entities.Review.filter({
          contractor_id: contractor.id
        });
        for (const review of contractorReviews) {
          await base44.asServiceRole.entities.Review.delete(review.id);
          reviewsDeleted++;
        }
        
        // Delete the contractor
        await base44.asServiceRole.entities.Contractor.delete(contractor.id);
        contractorsDeleted++;
      } catch (e) {
        errors.push(`Failed to delete contractor ${contractor.id}: ${e.message}`);
      }
    }

    // Delete expired customers and their related reviews
    for (const customer of expiredCustomers) {
      try {
        // Delete all reviews by this customer
        const customerReviews = await base44.asServiceRole.entities.Review.filter({
          reviewer_email: customer.email
        });
        for (const review of customerReviews) {
          await base44.asServiceRole.entities.Review.delete(review.id);
          reviewsDeleted++;
        }
        
        // Delete the customer profile
        await base44.asServiceRole.entities.CustomerProfile.delete(customer.id);
        customersDeleted++;
      } catch (e) {
        errors.push(`Failed to delete customer ${customer.id}: ${e.message}`);
      }
    }

    return Response.json({
      success: true,
      contractorsDeleted,
      customersDeleted,
      reviewsDeleted,
      timestamp: now,
      errors: errors.length > 0 ? errors : null
    });
  } catch (error) {
    console.error('Cleanup error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});