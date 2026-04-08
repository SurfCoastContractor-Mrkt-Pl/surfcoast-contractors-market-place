import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const contractorEmail = body.contractor_email || user.email;

    // Fetch approved/active scopes with work dates
    const scopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: contractorEmail,
      status: 'approved'
    });

    // Fetch availability slots
    const slots = await base44.entities.AvailabilitySlot.filter({
      contractor_id: body.contractor_id || ''
    });

    // Build context for AI
    const jobSummaries = scopes.map(s => ({
      id: s.id,
      title: s.job_title,
      client: s.client_name,
      date: s.agreed_work_date,
      cost_type: s.cost_type,
      estimated_hours: s.estimated_hours || null,
      location_hint: s.client_email // anonymized reference
    }));

    const availabilitySummary = slots.map(sl => ({
      date: sl.date,
      start: sl.start_time,
      end: sl.end_time,
      available: sl.available
    }));

    const prompt = `You are an AI scheduling assistant for a contractor. Analyze the following jobs and availability, then provide smart scheduling recommendations.

ACTIVE JOBS (approved, needing scheduling):
${JSON.stringify(jobSummaries, null, 2)}

AVAILABILITY SLOTS:
${availabilitySummary.length > 0 ? JSON.stringify(availabilitySummary, null, 2) : 'No availability slots set yet.'}

TODAY'S DATE: ${new Date().toISOString().split('T')[0]}

Provide:
1. A prioritized schedule recommendation for the next 7 days
2. Any scheduling conflicts or warnings
3. Tips to optimize the workweek (e.g. cluster nearby jobs, buffer time)
4. An overall efficiency score (0-100)

Be concise and practical. Focus on actionable advice.`;

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          recommendations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                date: { type: 'string' },
                startTime: { type: 'string' },
                endTime: { type: 'string' },
                jobTitle: { type: 'string' },
                clientName: { type: 'string' },
                reason: { type: 'string' }
              }
            }
          },
          conflicts: {
            type: 'array',
            items: { type: 'string' }
          },
          tips: {
            type: 'array',
            items: { type: 'string' }
          },
          efficiencyScore: { type: 'number' },
          travelWarning: { type: 'string' },
          summary: { type: 'string' }
        }
      }
    });

    return Response.json(result);
  } catch (error) {
    console.error('AI Scheduling error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});