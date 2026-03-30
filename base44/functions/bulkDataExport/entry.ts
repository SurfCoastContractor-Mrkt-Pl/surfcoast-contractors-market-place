import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { export_type, date_range } = await req.json();
    const results = {
      timestamp: new Date().toISOString(),
      export_type,
      status: 'generating',
      file_size: 0,
      record_count: 0,
    };

    let data = [];
    let fileName = `export_${export_type}_${new Date().toISOString().split('T')[0]}.csv`;

    const getDateRange = (days = 30) => {
      const end = new Date();
      const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
      return { start: start.toISOString(), end: end.toISOString() };
    };

    const range = date_range ? getDateRange(date_range) : getDateRange(30);

    // Export types
    if (export_type === 'contractors') {
      const contractors = await base44.asServiceRole.entities.Contractor.list('-updated_date', 10000);
      data = contractors.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        location: c.location,
        trade: c.trade_specialty,
        rating: c.rating,
        completed_jobs: c.completed_jobs_count,
        verified: c.identity_verified,
        stripe_connected: c.stripe_account_setup_complete,
        created_date: c.created_date,
      }));
      fileName = `contractors_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (export_type === 'transactions') {
      const payments = await base44.asServiceRole.entities.Payment.filter(
        { created_date: { $gte: range.start, $lte: range.end } },
        '-created_date',
        10000
      );
      data = payments.map(p => ({
        payment_id: p.id,
        amount: p.amount,
        payer: p.payer_email,
        contractor: p.contractor_email,
        status: p.status,
        purpose: p.purpose,
        created_date: p.created_date,
      }));
      fileName = `transactions_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (export_type === 'jobs') {
      const jobs = await base44.asServiceRole.entities.Job.filter(
        { created_date: { $gte: range.start, $lte: range.end } },
        '-created_date',
        10000
      );
      data = jobs.map(j => ({
        job_id: j.id,
        title: j.title,
        location: j.location,
        budget_min: j.budget_min,
        budget_max: j.budget_max,
        status: j.status,
        poster: j.poster_email,
        created_date: j.created_date,
      }));
      fileName = `jobs_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (export_type === 'scopes') {
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter(
        { created_date: { $gte: range.start, $lte: range.end } },
        '-created_date',
        10000
      );
      data = scopes.map(s => ({
        scope_id: s.id,
        job_title: s.job_title,
        contractor: s.contractor_email,
        client: s.client_email,
        cost: s.cost_amount,
        cost_type: s.cost_type,
        status: s.status,
        created_date: s.created_date,
        closed_date: s.closed_date,
      }));
      fileName = `scopes_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (export_type === 'reviews') {
      const reviews = await base44.asServiceRole.entities.Review.filter(
        { created_date: { $gte: range.start, $lte: range.end } },
        '-created_date',
        10000
      );
      data = reviews.map(r => ({
        review_id: r.id,
        contractor: r.contractor_name,
        reviewer: r.reviewer_name,
        rating: r.overall_rating,
        quality: r.quality_rating,
        communication: r.communication_rating,
        professionalism: r.professionalism_rating,
        verified: r.verified,
        created_date: r.created_date,
      }));
      fileName = `reviews_${new Date().toISOString().split('T')[0]}.csv`;
    }

    if (export_type === 'disputes') {
      const disputes = await base44.asServiceRole.entities.Dispute.filter(
        { created_date: { $gte: range.start, $lte: range.end } },
        '-created_date',
        10000
      );
      data = disputes.map(d => ({
        dispute_id: d.id,
        initiator: d.initiator_email,
        respondent: d.respondent_email,
        reason: d.reason,
        amount: d.amount,
        status: d.status,
        created_date: d.created_date,
        resolved_date: d.resolved_date,
      }));
      fileName = `disputes_${new Date().toISOString().split('T')[0]}.csv`;
    }

    // Convert to CSV
    if (data.length === 0) {
      return Response.json({ error: 'No data found for export', status: 'empty' });
    }

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers
          .map(h => {
            const val = row[h];
            if (val === null || val === undefined) return '';
            if (typeof val === 'string' && val.includes(',')) return `"${val}"`;
            return val;
          })
          .join(',')
      ),
    ].join('\n');

    results.status = 'ready';
    results.record_count = data.length;
    results.file_size = new Uint8Array(new TextEncoder().encode(csvContent)).length;
    results.file_name = fileName;
    results.csv_preview = csvContent.split('\n').slice(0, 5).join('\n');

    console.log('Data export generated:', results);
    return Response.json(results);
  } catch (error) {
    console.error('Data export error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});