import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated user — must be a contractor or admin to create Notion pages
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, scopeId, title, description, status } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('notion');
    const parentPageId = Deno.env.get('NOTION_PROJECT_PARENT_PAGE_ID');

    if (action === 'createProject') {
      // Create new Notion page for project
      const response = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Notion-Version': '2022-06-28',
        },
        body: JSON.stringify({
          parent: { page_id: parentPageId },
          properties: {
            title: { title: [{ text: { content: title } }] },
            Status: { select: { name: status || 'In Progress' } },
            Description: { rich_text: [{ text: { content: description || '' } }] },
            'Scope ID': { rich_text: [{ text: { content: scopeId } }] },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Notion sync failed:', error);
        return Response.json({ error: 'Notion sync failed' }, { status: 400 });
      }

      const page = await response.json();
      console.log('Project created in Notion:', page.id);
      return Response.json({ success: true, pageId: page.id });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Notion sync error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});