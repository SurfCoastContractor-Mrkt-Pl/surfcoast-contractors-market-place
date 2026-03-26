import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { scope_id, contractor_rating, customer_rating } = body;

    if (!scope_id) {
      return Response.json({ error: 'Missing scope_id' }, { status: 400 });
    }

    // Verify user authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the scope via service role for reliable access
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ id: scope_id });
    if (!scopes || scopes.length === 0) {
      return Response.json({ error: 'Scope not found' }, { status: 404 });
    }

    const scope = scopes[0];

    // Verify user is either contractor or customer for this scope
    if (user.email !== scope.contractor_email && user.email !== scope.customer_email) {
      return Response.json({ error: 'Unauthorized: Not associated with this project' }, { status: 403 });
    }

    // Update scope status to closed via service role (RLS-safe)
    await base44.asServiceRole.entities.ScopeOfWork.update(scope_id, {
      status: 'closed',
      closed_date: new Date().toISOString(),
      contractor_satisfaction_rating: user.email === scope.contractor_email ? contractor_rating : scope.contractor_satisfaction_rating,
      customer_satisfaction_rating: user.email === scope.customer_email ? customer_rating : scope.customer_satisfaction_rating,
    });

    // Increment contractor completion counts
    const contractorResults = await base44.asServiceRole.entities.Contractor.filter({ email: scope.contractor_email });
    if (contractorResults && contractorResults.length > 0) {
      const contractor = contractorResults[0];
      const currentCount = contractor.completed_jobs_count || 0;
      const currentUniqueCustomers = contractor.unique_customers_count || 0;

      // Check if this customer is new to the contractor
      const existingClosedScopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
        contractor_email: scope.contractor_email,
        customer_email: scope.customer_email,
        status: 'closed',
      });

      const isNewCustomer = existingClosedScopes.length === 1; // Only this one is now closed

      await base44.asServiceRole.entities.Contractor.update(contractor.id, {
        completed_jobs_count: currentCount + 1,
        unique_customers_count: isNewCustomer ? currentUniqueCustomers + 1 : currentUniqueCustomers,
      });
    }

    // Increment customer completion count
    const customerResults = await base44.asServiceRole.entities.CustomerProfile.filter({ email: scope.customer_email });
    if (customerResults && customerResults.length > 0) {
      const currentCount = customerResults[0].completed_jobs_count || 0;
      await base44.asServiceRole.entities.CustomerProfile.update(customerResults[0].id, {
        completed_jobs_count: currentCount + 1,
      });
    }

    return Response.json({
      success: true,
      message: 'Project marked as complete and counts updated'
    });

  } catch (error) {
    console.error('Error finalizing project completion:', error.message);
    return Response.json({ error: 'Failed to finalize completion' }, { status: 500 });
  }
});