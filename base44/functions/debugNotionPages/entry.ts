import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('notion');
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    // Search for all pages accessible to the integration
    const res = await fetch('https://api.notion.com/v1/search', {
      method: 'POST',
      headers,
      body: JSON.stringify({ filter: { value: 'page', property: 'object' }, page_size: 20 })
    });

    const data = await res.json();
    if (!res.ok) {
      return Response.json({ error: data.message }, { status: res.status });
    }

    const pages = (data.results || []).map(p => ({
      id: p.id,
      archived: p.archived,
      title: p.properties?.title?.title?.[0]?.plain_text || p.properties?.Name?.title?.[0]?.plain_text || '(untitled)',
      url: p.url,
      last_edited: p.last_edited_time
    }));

    return Response.json({ pages });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
});