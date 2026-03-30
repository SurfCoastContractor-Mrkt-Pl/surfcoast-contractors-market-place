// Database Migration System
// Manage schema changes and data migrations safely with rollback support

import { base44 } from '@/api/base44Client';

export const MIGRATION_STATUS = {
  PENDING: 'pending',
  APPLIED: 'applied',
  FAILED: 'failed',
  ROLLED_BACK: 'rolled_back'
};

class MigrationManager {
  constructor() {
    this.migrations = [];
  }

  register(migration) {
    if (!migration.name || !migration.up) {
      throw new Error('Migration must have name and up function');
    }
    this.migrations.push(migration);
  }

  registerMultiple(migrationList) {
    migrationList.forEach(m => this.register(m));
  }

  async apply(migrationName) {
    try {
      const response = await base44.functions.invoke('applyMigration', {
        migrationName
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to apply migration ${migrationName}: ${error.message}`);
    }
  }

  async rollback(migrationName) {
    try {
      const response = await base44.functions.invoke('rollbackMigration', {
        migrationName
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to rollback migration ${migrationName}: ${error.message}`);
    }
  }

  async getStatus() {
    try {
      const response = await base44.functions.invoke('getMigrationStatus', {});
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get migration status: ${error.message}`);
    }
  }

  async applyPending() {
    try {
      const response = await base44.functions.invoke('applyPendingMigrations', {});
      return response.data;
    } catch (error) {
      throw new Error(`Failed to apply pending migrations: ${error.message}`);
    }
  }
}

export const migrationManager = new MigrationManager();

// Standard migration template
export function createMigration(name, upFn, downFn) {
  return {
    name,
    up: upFn,
    down: downFn || (() => Promise.resolve())
  };
}