import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { jobs } = await req.json();
    if (!Array.isArray(jobs) || jobs.length === 0) {
      return Response.json({ error: 'Jobs array required' }, { status: 400 });
    }

    const results = {
      created: 0,
      failed: 0,
      errors: [],
    };

    for (const jobData of jobs) {
      try {
        // Validate required fields
        if (!jobData.title || !jobData.description || !jobData.location) {
          throw new Error('Missing required fields: title, description, location');
        }

        // Create job
        await base44.entities.Job.create({
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          budget_min: jobData.budget_min,
          budget_max: jobData.budget_max,
          budget_type: jobData.budget_type || 'fixed',
          start_date: jobData.start_date,
          duration: jobData.duration,
          poster_name: user.full_name,
          poster_email: user.email,
          poster_phone: jobData.poster_phone,
          contractor_type_needed: jobData.contractor_type_needed || 'general',
          trade_needed: jobData.trade_needed,
          status: 'open',
          urgency: jobData.urgency || 'medium',
        });

        results.created++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          title: jobData.title,
          error: error.message,
        });
      }
    }

    return Response.json({
      summary: `Imported ${results.created} jobs, ${results.failed} failed`,
      ...results,
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});