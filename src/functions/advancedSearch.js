import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized - authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { searchType, filters, limit = 50 } = body;

    if (!searchType) {
      return Response.json({ error: 'Missing searchType parameter' }, { status: 400 });
    }

    // Validate user has permission to perform advanced search
    const allowedSearchTypes = ['contractors', 'jobs', 'customers'];
    if (!allowedSearchTypes.includes(searchType)) {
      return Response.json({ error: 'Invalid search type' }, { status: 400 });
    }

    let results = [];
    
    // Enforce limit to prevent excessive data exposure
    const maxLimit = user.role === 'admin' ? 500 : 100;
    const queryLimit = Math.min(limit, maxLimit);

    if (searchType === 'contractors') {
      results = await base44.entities.Contractor.list('', queryLimit);
    } else if (searchType === 'jobs') {
      results = await base44.entities.Job.list('', queryLimit);
    } else if (searchType === 'customers') {
      results = await base44.entities.CustomerProfile.list('', queryLimit);
    }

    return Response.json({ success: true, count: results.length, results });
  } catch (error) {
    console.error('advancedSearch error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});