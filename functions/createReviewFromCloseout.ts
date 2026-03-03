import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { scopeId } = await req.json();

    if (!scopeId) {
      return Response.json({ error: 'scopeId required' }, { status: 400 });
    }

    // Fetch the closed scope
    let scope;
    try {
      scope = await base44.asServiceRole.entities.ScopeOfWork.get(scopeId);
    } catch (error) {
      if (error.message && error.message.includes('not found')) {
        return Response.json({ error: 'Scope not found' }, { status: 404 });
      }
      throw error;
    }

    if (scope.status !== 'closed') {
      return Response.json({ error: 'Scope must be closed before creating review' }, { status: 400 });
    }

    // Check if review already exists for this contractor from this customer
    const existing = await base44.asServiceRole.entities.Review.filter({ 
      contractor_id: scope.contractor_id,
      reviewer_email: scope.customer_email
    });

    if (existing && existing.length > 0) {
      return Response.json({ success: false, message: 'Review already exists for this scope' });
    }

    // Create a pending review (customer will fill in rating/comment later)
    const review = await base44.asServiceRole.entities.Review.create({
      contractor_id: scope.contractor_id,
      contractor_name: scope.contractor_name,
      reviewer_name: scope.customer_name,
      reviewer_email: scope.customer_email,
      reviewer_type: 'customer',
      scope_id: scopeId,
      job_title: scope.job_title,
      overall_rating: 5, // Default to 5, customer can update
      quality_rating: 5,
      punctuality_rating: 5,
      communication_rating: 5,
      professionalism_rating: 5,
      comment: 'Pending review completion',
      verified: false, // Will be true once customer confirms
      work_date: scope.agreed_work_date || new Date().toISOString().split('T')[0],
    });

    // Send email to customer requesting review
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: scope.customer_email,
      subject: `Review ${scope.contractor_name} for "${scope.job_title}"`,
      body: `Hello ${scope.customer_name},\n\nThank you for completing your engagement with ${scope.contractor_name} on "${scope.job_title}".\n\nPlease take a moment to review the contractor's work on ContractorHub. Your feedback helps maintain quality on our platform.\n\nReview ID: ${review.id}\n\nContractorHub`,
    });

    return Response.json({ success: true, reviewId: review.id });
    } catch (error) {
    console.error('Review creation error:', error.message);
    // Return 404 if scope not found, otherwise 500
    if (error.message && error.message.includes('not found')) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }
    return Response.json({ error: error.message }, { status: 500 });
    }
});