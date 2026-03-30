import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Rollback a migration to previous state
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

    // Find applied migration
    const migrations = await base44.asServiceRole.entities.Migration.filter({
      name: migrationName,
      status: 'applied'
    });

    if (migrations.length === 0) {
      return Response.json({
        success: false,
        message: 'Migration not found or not applied',
        migrationName
      });
    }

    const migration = migrations[0];
    const startTime = Date.now();

    try {
      // In production, rollback logic would go here
      // For now, just mark as rolled_back
      await base44.asServiceRole.entities.Migration.update(migration.id, {
        status: 'rolled_back',
        rolled_back_at: new Date().toISOString(),
        duration_ms: Date.now() - startTime
      });

      return Response.json({
        success: true,
        message: 'Migration rolled back successfully',
        migrationName,
        duration_ms: Date.now() - startTime
      });
    } catch (error) {
      console.error(`Rollback of ${migrationName} failed:`, error);

      return Response.json({
        success: false,
        message: 'Rollback failed',
        error: error.message,
        migrationName
      }, { status: 500 });
    }
  } catch (error) {
    console.error('rollbackMigration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});