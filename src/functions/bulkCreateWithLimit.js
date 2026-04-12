/**
 * Bulk Create with Batch Size Limit
 * Prevents memory spikes by limiting batch size to 500 records
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { entity_name, records } = await req.json();

    if (!entity_name || !records || !Array.isArray(records)) {
      return Response.json({ error: 'entity_name and records array required' }, { status: 400 });
    }

    // Enforce batch size limit
    const MAX_BATCH_SIZE = 500;
    if (records.length > MAX_BATCH_SIZE) {
      return Response.json({ 
        error: `Batch size limit exceeded (max ${MAX_BATCH_SIZE}, got ${records.length})`,
        status: 'rejected'
      }, { status: 400 });
    }

    // Batch into chunks of 100 for processing
    const CHUNK_SIZE = 100;
    const chunks = [];
    for (let i = 0; i < records.length; i += CHUNK_SIZE) {
      chunks.push(records.slice(i, i + CHUNK_SIZE));
    }

    const results = [];
    for (const chunk of chunks) {
      const created = await base44.entities[entity_name].bulkCreate(chunk);
      results.push(...created);
    }

    console.log(`Bulk created ${results.length} ${entity_name} records in ${chunks.length} chunks`);

    return Response.json({ 
      success: true,
      created: results.length,
      total_requested: records.length,
      batches: chunks.length
    });
  } catch (error) {
    console.error('bulkCreateWithLimit error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});