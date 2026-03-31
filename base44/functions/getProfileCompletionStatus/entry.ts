import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is contractor or customer
    const contractors = await base44.entities.Contractor.filter(
      { email: user.email },
      null,
      1
    );

    const customers = await base44.entities.CustomerProfile.filter(
      { email: user.email },
      null,
      1
    );

    let completionStatus = null;

    if (contractors.length > 0) {
      const contractor = contractors[0];
      const requiredFields = ['name', 'location', 'contractor_type', 'hourly_rate', 'bio'];
      const completedFields = requiredFields.filter(field => contractor[field]);
      const percentComplete = Math.round((completedFields.length / requiredFields.length) * 100);

      completionStatus = {
        userType: 'contractor',
        percentComplete,
        completedFields,
        remainingFields: requiredFields.filter(f => !contractor[f]),
        isComplete: percentComplete === 100
      };
    } else if (customers.length > 0) {
      const customer = customers[0];
      const requiredFields = ['full_name', 'location', 'property_type'];
      const completedFields = requiredFields.filter(field => customer[field]);
      const percentComplete = Math.round((completedFields.length / requiredFields.length) * 100);

      completionStatus = {
        userType: 'customer',
        percentComplete,
        completedFields,
        remainingFields: requiredFields.filter(f => !customer[f]),
        isComplete: percentComplete === 100
      };
    }

    return Response.json({ 
      success: true, 
      completionStatus 
    });
  } catch (error) {
    console.error('getProfileCompletionStatus error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});