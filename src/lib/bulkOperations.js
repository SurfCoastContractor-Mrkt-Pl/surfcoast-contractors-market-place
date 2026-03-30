import { base44 } from '@/api/base44Client';

/**
 * Bulk operations for batch processing
 */

export const bulkOps = {
  /**
   * Bulk create records with error handling
   */
  async bulkCreate(entityName, records, batchSize = 100) {
    const results = {
      created: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);

      const promises = batch.map(async (record) => {
        try {
          await base44.entities[entityName].create(record);
          results.created++;
        } catch (error) {
          results.failed++;
          results.errors.push({ record, error: error.message });
        }
      });

      await Promise.all(promises);
    }

    return results;
  },

  /**
   * Bulk update records
   */
  async bulkUpdate(entityName, updates, batchSize = 100) {
    const results = {
      updated: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize);

      const promises = batch.map(async ({ id, data }) => {
        try {
          await base44.entities[entityName].update(id, data);
          results.updated++;
        } catch (error) {
          results.failed++;
          results.errors.push({ id, error: error.message });
        }
      });

      await Promise.all(promises);
    }

    return results;
  },

  /**
   * Bulk delete records
   */
  async bulkDelete(entityName, ids, batchSize = 100) {
    const results = {
      deleted: 0,
      failed: 0,
      errors: [],
    };

    for (let i = 0; i < ids.length; i += batchSize) {
      const batch = ids.slice(i, i + batchSize);

      const promises = batch.map(async (id) => {
        try {
          await base44.entities[entityName].delete(id);
          results.deleted++;
        } catch (error) {
          results.failed++;
          results.errors.push({ id, error: error.message });
        }
      });

      await Promise.all(promises);
    }

    return results;
  },

  /**
   * Import from CSV data
   */
  async importFromCSV(entityName, csvData) {
    // csvData should be array of objects
    const records = csvData;
    return await this.bulkCreate(entityName, records);
  },

  /**
   * Export entity data as CSV
   */
  async exportToCSV(entityName, filter = {}, limit = 10000) {
    try {
      const records = await base44.entities[entityName].filter(filter, '-created_date', limit);

      if (records.length === 0) return null;

      // Convert to CSV
      const keys = Object.keys(records[0]);
      const csv = [
        keys.join(','),
        ...records.map(record =>
          keys
            .map(key => {
              const value = record[key];
              // Escape commas and quotes
              if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                return `"${value.replace(/"/g, '""')}"`;
              }
              return value || '';
            })
            .join(',')
        ),
      ].join('\n');

      return csv;
    } catch (error) {
      console.error('Export error:', error);
      throw error;
    }
  },

  /**
   * Bulk operation progress tracker
   */
  createProgressTracker: (totalItems) => ({
    processed: 0,
    succeeded: 0,
    failed: 0,
    getProgress: function () {
      return {
        percent: Math.round((this.processed / totalItems) * 100),
        processed: this.processed,
        total: totalItems,
      };
    },
    increment: function (success = true) {
      this.processed++;
      if (success) this.succeeded++;
      else this.failed++;
    },
  }),
};