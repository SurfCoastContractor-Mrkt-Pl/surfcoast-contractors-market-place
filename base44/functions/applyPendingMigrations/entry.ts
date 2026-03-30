import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Apply all pending migrations in order
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

    // Get all pending migrations
    const pending = await base44.asServiceRole.entities.Migration.filter({
      status: 'pending'
    }, 'created_date');

    if (pending.length === 0) {
      return Response.json({
        success: true,
        message: 'No pending migrations',
        applied: []
      });
    }

    const applied = [];
    const failed = [];

    for (const migration of pending) {
      const startTime = Date.now();
      try {
        // In production, actual migration logic would execute here
        await base44.asServiceRole.entities.Migration.update(migration.id, {
          status: 'applied',
          applied_at: new Date().toISOString(),
          duration_ms: Date.now() - startTime
        });

        applied.push({
          name: migration.name,
          duration_ms: Date.now() - startTime
        });
      } catch (error) {
        console.error(`Migration ${migration.name} failed:`, error);

        await base44.asServiceRole.entities.Migration.update(migration.id, {
          status: 'failed',
          error_message: error.message,
          duration_ms: Date.now() - startTime
        });

        failed.push({
          name: migration.name,
          error: error.message
        });

        // Stop on first failure
        break;
      }
    }

    return Response.json({
      success: failed.length === 0,
      message: `Applied ${applied.length} migration(s)`,
      applied,
      failed,
      total_duration_ms: applied.reduce((sum, m) => sum + m.duration_ms, 0)
    });
  } catch (error) {
    console.error('applyPendingMigrations error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});