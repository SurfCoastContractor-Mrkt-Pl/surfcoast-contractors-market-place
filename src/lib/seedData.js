// Database Seed Utilities
// Safe seeding functions for development and testing

import { base44 } from '@/api/base44Client';

export const SEED_STATUS = {
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILED: 'failed'
};

class SeedManager {
  constructor() {
    this.seeds = {};
  }

  register(name, seedFn) {
    this.seeds[name] = seedFn;
  }

  registerMultiple(seedMap) {
    Object.assign(this.seeds, seedMap);
  }

  async run(seedName, options = {}) {
    if (!this.seeds[seedName]) {
      throw new Error(`Seed '${seedName}' not found`);
    }

    try {
      const result = await this.seeds[seedName](base44, options);
      return {
        status: SEED_STATUS.SUCCESS,
        seedName,
        result
      };
    } catch (error) {
      console.error(`Seed '${seedName}' failed:`, error);
      return {
        status: SEED_STATUS.FAILED,
        seedName,
        error: error.message
      };
    }
  }

  async runAll(options = {}) {
    const results = {};
    let failed = 0;

    for (const [name, seedFn] of Object.entries(this.seeds)) {
      try {
        results[name] = await seedFn(base44, options);
      } catch (error) {
        console.error(`Seed '${name}' failed:`, error);
        results[name] = { error: error.message };
        failed++;
      }
    }

    return {
      status: failed === 0 ? SEED_STATUS.SUCCESS : SEED_STATUS.PARTIAL,
      total: Object.keys(this.seeds).length,
      failed,
      results
    };
  }

  async clearEntity(entityName) {
    try {
      // Get all records
      const records = await base44.asServiceRole.entities[entityName].list('', 1000);

      // Delete each one
      for (const record of records) {
        await base44.asServiceRole.entities[entityName].delete(record.id);
      }

      return { cleared: records.length };
    } catch (error) {
      console.error(`Failed to clear ${entityName}:`, error);
      throw error;
    }
  }
}

export const seedManager = new SeedManager();

// Utility to create seed data safely
export async function createBulkRecords(entityName, records, batchSize = 50) {
  const results = [];
  const errors = [];

  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, i + batchSize);

    try {
      const created = await base44.asServiceRole.entities[entityName].bulkCreate(batch);
      results.push(...created);
    } catch (error) {
      errors.push({
        batchIndex: i,
        error: error.message
      });
    }
  }

  return {
    created: results.length,
    errors,
    total: records.length,
    success: errors.length === 0
  };
}