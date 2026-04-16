import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user — prevents public abuse of service-role data access
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Scope searches: non-admins can only search scopes they own
    const { search_type, query, filters, limit = 50 } = await req.json();

    const results = {
      timestamp: new Date().toISOString(),
      search_type,
      query,
      results: [],
      total_count: 0,
    };

    const queryLower = query?.toLowerCase() || '';

    // Search contractors
    if (search_type === 'contractors') {
      const contractors = await base44.asServiceRole.entities.Contractor.list('-rating', 1000);

      let filtered = contractors || [];

      // Text search across multiple fields
      if (query) {
        filtered = filtered.filter(
          c =>
            c.name?.toLowerCase().includes(queryLower) ||
            c.email?.toLowerCase().includes(queryLower) ||
            c.location?.toLowerCase().includes(queryLower) ||
            c.bio?.toLowerCase().includes(queryLower) ||
            c.trade_specialty?.toLowerCase().includes(queryLower)
        );
      }

      // Apply filters
      if (filters) {
        if (filters.min_rating) {
          filtered = filtered.filter(c => (c.rating || 0) >= filters.min_rating);
        }
        if (filters.trade) {
          filtered = filtered.filter(c => c.trade_specialty === filters.trade);
        }
        if (filters.available) {
          filtered = filtered.filter(c => c.available === filters.available);
        }
        if (filters.verified) {
          filtered = filtered.filter(c => c.identity_verified === filters.verified);
        }
        if (filters.location) {
          filtered = filtered.filter(c =>
            c.location?.toLowerCase().includes(filters.location.toLowerCase())
          );
        }
      }

      results.results = filtered.slice(0, limit).map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        trade: c.trade_specialty,
        location: c.location,
        rating: c.rating,
        reviews: c.reviews_count,
        verified: c.identity_verified,
      }));
      results.total_count = filtered.length;
    }

    // Search jobs
    if (search_type === 'jobs') {
      const jobs = await base44.asServiceRole.entities.Job.filter(
        { status: { $in: ['open', 'in_progress'] } },
        '-created_date',
        1000
      );

      let filtered = jobs || [];

      if (query) {
        filtered = filtered.filter(
          j =>
            j.title?.toLowerCase().includes(queryLower) ||
            j.description?.toLowerCase().includes(queryLower) ||
            j.location?.toLowerCase().includes(queryLower)
        );
      }

      if (filters) {
        if (filters.trade) {
          filtered = filtered.filter(j => j.trade_needed === filters.trade);
        }
        if (filters.min_budget) {
          filtered = filtered.filter(j => (j.budget_max || 0) >= filters.min_budget);
        }
        if (filters.max_budget) {
          filtered = filtered.filter(j => (j.budget_min || 0) <= filters.max_budget);
        }
        if (filters.location) {
          filtered = filtered.filter(j =>
            j.location?.toLowerCase().includes(filters.location.toLowerCase())
          );
        }
      }

      results.results = filtered.slice(0, limit).map(j => ({
        id: j.id,
        title: j.title,
        location: j.location,
        budget_min: j.budget_min,
        budget_max: j.budget_max,
        trade: j.trade_needed,
        status: j.status,
        created_date: j.created_date,
      }));
      results.total_count = filtered.length;
    }

    // Search scopes — non-admins can only see their own scopes
    if (search_type === 'scopes') {
      let scopes;
      if (user.role === 'admin') {
        scopes = await base44.asServiceRole.entities.ScopeOfWork.list('-updated_date', 1000);
      } else {
        // Restrict to scopes the user is party to
        scopes = await base44.entities.ScopeOfWork.list('-updated_date', 1000);
      }

      let filtered = scopes || [];

      if (query) {
        filtered = filtered.filter(
          s =>
            s.job_title?.toLowerCase().includes(queryLower) ||
            s.contractor_name?.toLowerCase().includes(queryLower) ||
            s.client_name?.toLowerCase().includes(queryLower)
        );
      }

      if (filters) {
        if (filters.status) {
          filtered = filtered.filter(s => s.status === filters.status);
        }
        // Non-admins: ignore any attempt to filter by another user's email
        if (user.role === 'admin' && filters.contractor_email) {
          filtered = filtered.filter(s => s.contractor_email === filters.contractor_email);
        }
        if (user.role === 'admin' && filters.client_email) {
          filtered = filtered.filter(s => s.client_email === filters.client_email);
        }
      }

      results.results = filtered.slice(0, limit).map(s => ({
        id: s.id,
        job_title: s.job_title,
        contractor: s.contractor_name,
        client: s.client_name,
        cost: s.cost_amount,
        status: s.status,
        created_date: s.created_date,
        // contractor_email intentionally omitted — sensitive PII
      }));
      results.total_count = filtered.length;
    }

    console.log('Advanced search complete:', results);
    return Response.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});