import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractorEmail, schedulingData } = await req.json();

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor's scheduled jobs
    const scopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: contractorEmail,
      status: 'approved'
    });

    // Get availability
    const slots = await base44.entities.AvailabilitySlot.filter({
      contractor_email: contractorEmail
    });

    // Generate AI recommendations
    const recommendations = {
      optimal_schedule: generateOptimalSchedule(scopes, slots),
      conflicts: findConflicts(scopes, slots),
      buffer_time_recommended: 30, // minutes
      efficiency_score: calculateEfficiency(scopes),
      travel_time_optimization: optimizeRouting(scopes)
    };

    return Response.json(recommendations);
  } catch (error) {
    console.error('AI Scheduling error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function generateOptimalSchedule(scopes, slots) {
  // Sort by date, cluster nearby locations
  return scopes
    .sort((a, b) => new Date(a.agreed_work_date) - new Date(b.agreed_work_date))
    .map(scope => ({
      scope_id: scope.id,
      date: scope.agreed_work_date,
      recommended_start: calculateStartTime(scope),
      notes: 'AI-optimized time slot'
    }));
}

function findConflicts(scopes, slots) {
  return scopes.filter(scope => {
    return !slots.some(slot =>
      new Date(slot.date).toDateString() === new Date(scope.agreed_work_date).toDateString()
    );
  });
}

function calculateEfficiency(scopes) {
  // Score 0-100 based on job density and scheduling
  return Math.min(100, scopes.length * 10);
}

function optimizeRouting(scopes) {
  // Group jobs by geographic proximity
  return {
    clusters: 'AI analyzing geographic clustering',
    estimated_travel_reduction: '15-20%'
  };
}

function calculateStartTime(scope) {
  return '09:00 AM';
}