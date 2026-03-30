import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Paginate entity queries
 * Usage in backend functions:
 * const { items, total, page, pageSize, pages } = await paginateQuery(base44, 'EntityName', query, page, pageSize);
 */
export async function paginateQuery(base44, entityName, query = {}, page = 1, pageSize = 20) {
  const entity = base44.entities[entityName];
  if (!entity) throw new Error(`Entity ${entityName} not found`);

  const skip = (page - 1) * pageSize;
  
  // Fetch items for this page
  const items = await entity.filter(query, '-created_date', pageSize, skip);
  
  // Get total count (approximate - filter gets all matching)
  const allMatching = await entity.filter(query, '-created_date', 1000);
  const total = allMatching.length;
  const pages = Math.ceil(total / pageSize);

  return {
    items,
    total,
    page,
    pageSize,
    pages,
    hasMore: page < pages,
  };
}

// Example endpoint
Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { entityName, query, page = 1, pageSize = 20 } = await req.json();
    const base44 = createClientFromRequest(req);

    const result = await paginateQuery(base44, entityName, query, page, pageSize);
    return Response.json(result);
  } catch (error) {
    console.error('[PAGINATE-ERROR]', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});