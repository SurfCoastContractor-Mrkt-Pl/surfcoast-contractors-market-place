import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { job_id } = await req.json();

    // Fetch job details
    const job = await base44.entities.Job.filter({ id: job_id });
    if (!job?.length) {
      return Response.json({ error: 'Job not found' }, { status: 404 });
    }

    // Fetch contractor availability and approved scopes
    const availableSlots = await base44.entities.AvailabilitySlot.filter({
      available: true,
      created_by: user.email
    });

    const approvedScopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: user.email,
      status: 'approved'
    });

    // Use LLM to suggest optimal scheduling
    const aiResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a scheduling expert. Based on the following job and contractor availability, suggest the 3 best time slots to schedule this job.

Job Details:
- Title: ${job[0]?.title}
- Description: ${job[0]?.description}
- Location: ${job[0]?.location}
- Duration: ${job[0]?.duration}

Available Slots:
${availableSlots.slice(0, 10).map(s => `- ${s.date} from ${s.start_time} to ${s.end_time}`).join('\n')}

Already Scheduled Jobs:
${approvedScopes.slice(0, 5).map(s => `- ${s.job_title} on ${s.agreed_work_date}`).join('\n')}

Provide your response as JSON with format:
{
  "recommendations": [
    { "date": "YYYY-MM-DD", "startTime": "HH:MM", "endTime": "HH:MM", "reason": "..." }
  ],
  "constraints": ["list any scheduling constraints"],
  "travelWarning": "note if location requires extra travel time"
}`,
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
                reason: { type: 'string' }
              }
            }
          },
          constraints: { type: 'array', items: { type: 'string' } },
          travelWarning: { type: 'string' }
        }
      }
    });

    return Response.json({
      success: true,
      recommendations: aiResponse.recommendations,
      constraints: aiResponse.constraints,
      travelWarning: aiResponse.travelWarning
    });
  } catch (error) {
    console.error('AI Scheduling Error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});