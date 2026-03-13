import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();
    
    const { scope_id, contractor_rating, customer_rating } = body;

    if (!scope_id) {
      return Response.json({ 
        error: 'Missing scope_id' 
      }, { status: 400 });
    }

    // Verify user authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ 
        error: 'Unauthorized' 
      }, { status: 401 });
    }

    // Fetch the scope
    const scopes = await base44.entities.ScopeOfWork.filter({ id: scope_id });
    if (!scopes || scopes.length === 0) {
      return Response.json({ 
        error: 'Scope not found' 
      }, { status: 404 });
    }

    const scope = scopes[0];

    // Verify user is either contractor or customer
    if (user.email !== scope.contractor_email && user.email !== scope.customer_email) {
      return Response.json({ 
        error: 'Unauthorized: Not associated with this project' 
      }, { status: 403 });
    }

    // Update scope status to closed
    await base44.entities.ScopeOfWork.update(scope_id, {
      status: 'closed',
      closed_date: new Date().toISOString(),
      contractor_satisfaction_rating: user.email === scope.contractor_email ? contractor_rating : scope.contractor_satisfaction_rating,
      customer_satisfaction_rating: user.email === scope.customer_email ? customer_rating : scope.customer_satisfaction_rating,
    });

    // Increment completion counts
    const contractor = await base44.entities.Contractor.filter({ email: scope.contractor_email });
    if (contractor && contractor.length > 0) {
      const currentCount = contractor[0].completed_jobs_count || 0;
      const currentUniqueCustomers = contractor[0].unique_customers_count || 0;
      
      // Check if this customer is new to the contractor
      const existingScopes = await base44.entities.ScopeOfWork.filter({
        contractor_email: scope.contractor_email,
        customer_email: scope.customer_email,
        status: 'closed',
      });
      
      const isNewCustomer = existingScopes.length === 1; // Only this one is closed

      await base44.entities.Contractor.update(contractor[0].id, {
        completed_jobs_count: currentCount + 1,
        unique_customers_count: isNewCustomer ? currentUniqueCustomers + 1 : currentUniqueCustomers,
      });
    }

    const customer = await base44.entities.CustomerProfile.filter({ email: scope.customer_email });
    if (customer && customer.length > 0) {
      const currentCount = customer[0].completed_jobs_count || 0;
      await base44.entities.CustomerProfile.update(customer[0].id, {
        completed_jobs_count: currentCount + 1,
      });
    }

    return Response.json({ 
      success: true,
      message: 'Project marked as complete and counts updated'
    });

  } catch (error) {
    console.error('Error finalizing project completion:', error);
    return Response.json({ 
      error: 'Failed to finalize completion',
      details: error.message 
    }, { status: 500 });
  }
});