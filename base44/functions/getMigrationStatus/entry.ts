import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Get status of all migrations
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all migrations ordered by creation date
    const migrations = await base44.asServiceRole.entities.Migration.list('created_date', 100);

    const stats = {
      total: migrations.length,
      applied: migrations.filter(m => m.status === 'applied').length,
      pending: migrations.filter(m => m.status === 'pending').length,
      failed: migrations.filter(m => m.status === 'failed').length,
      rolled_back: migrations.filter(m => m.status === 'rolled_back').length
    };

    return Response.json({
      success: true,
      migrations,
      stats,
      lastApplied: migrations.find(m => m.status === 'applied' && m.applied_at)?.name || null
    });
  } catch (error) {
    console.error('getMigrationStatus error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});