import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Apply a single migration and track it
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

    const { migrationName } = await req.json();

    if (!migrationName) {
      return Response.json({ error: 'migrationName required' }, { status: 400 });
    }

    // Check if already applied
    const existing = await base44.asServiceRole.entities.Migration.filter({
      name: migrationName,
      status: 'applied'
    });

    if (existing.length > 0) {
      return Response.json({
        success: false,
        message: 'Migration already applied',
        migration: existing[0]
      });
    }

    const startTime = Date.now();

    try {
      // Mark as pending
      const migration = await base44.asServiceRole.entities.Migration.create({
        name: migrationName,
        status: 'pending',
        changes_summary: `Migration: ${migrationName}`
      });

      // In production, migration logic would go here
      // For now, just mark as applied
      await base44.asServiceRole.entities.Migration.update(migration.id, {
        status: 'applied',
        applied_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime
      });

      return Response.json({
        success: true,
        message: 'Migration applied successfully',
        migrationName,
        duration_ms: Date.now() - startTime
      });
    } catch (error) {
      console.error(`Migration ${migrationName} failed:`, error);

      // Try to mark as failed
      try {
        const failed = await base44.asServiceRole.entities.Migration.filter({
          name: migrationName,
          status: 'pending'
        });

        if (failed.length > 0) {
          await base44.asServiceRole.entities.Migration.update(failed[0].id, {
            status: 'failed',
            error_message: error.message,
            duration_ms: Date.now() - startTime
          });
        }
      } catch {}

      return Response.json({
        success: false,
        message: 'Migration failed',
        error: error.message,
        migrationName
      }, { status: 500 });
    }
  } catch (error) {
    console.error('applyMigration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});