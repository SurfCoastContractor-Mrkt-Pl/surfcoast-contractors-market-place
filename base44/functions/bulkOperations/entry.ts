import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

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

    const { operation, entity, ids, update_data, filters } = await req.json();

    const results = {
      timestamp: new Date().toISOString(),
      operation,
      entity,
      success_count: 0,
      failed_count: 0,
      errors: [],
    };

    // Bulk update by IDs
    if (operation === 'bulk_update' && ids && update_data) {
      for (const id of ids) {
        try {
          await base44.asServiceRole.entities[entity].update(id, update_data);
          results.success_count++;
        } catch (e) {
          results.failed_count++;
          results.errors.push({ id, error: e.message });
        }
      }
    }

    // Bulk update by filter
    if (operation === 'bulk_update_filtered' && filters && update_data) {
      const items = await base44.asServiceRole.entities[entity].filter(filters, '-created_date', 10000);
      if (items && items.length > 0) {
        for (const item of items) {
          try {
            await base44.asServiceRole.entities[entity].update(item.id, update_data);
            results.success_count++;
          } catch (e) {
            results.failed_count++;
            results.errors.push({ id: item.id, error: e.message });
          }
        }
      }
    }

    // Bulk delete by IDs
    if (operation === 'bulk_delete' && ids) {
      for (const id of ids) {
        try {
          await base44.asServiceRole.entities[entity].delete(id);
          results.success_count++;
        } catch (e) {
          results.failed_count++;
          results.errors.push({ id, error: e.message });
        }
      }
    }

    // Bulk delete by filter
    if (operation === 'bulk_delete_filtered' && filters) {
      const items = await base44.asServiceRole.entities[entity].filter(filters, '-created_date', 10000);
      if (items && items.length > 0) {
        for (const item of items) {
          try {
            await base44.asServiceRole.entities[entity].delete(item.id);
            results.success_count++;
          } catch (e) {
            results.failed_count++;
            results.errors.push({ id: item.id, error: e.message });
          }
        }
      }
    }

    // Bulk create
    if (operation === 'bulk_create' && Array.isArray(update_data)) {
      for (const item of update_data) {
        try {
          await base44.asServiceRole.entities[entity].create(item);
          results.success_count++;
        } catch (e) {
          results.failed_count++;
          results.errors.push({ data: item, error: e.message });
        }
      }
    }

    console.log('Bulk operation completed:', results);
    return Response.json(results);
  } catch (error) {
    console.error('Bulk operation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});