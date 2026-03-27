import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Notion Auto-Sync Function
 * Triggered on ScopeOfWork create/update events
 * Automatically creates/updates linked Notion project pages
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data } = await req.json();

    if (!data || !data.id) {
      return Response.json({ error: 'Invalid event data' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('notion');
    const notionHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    // Default parent page ID for project documentation
    const PARENT_PAGE_ID = '330c3b3d-27dd-8159-a260-fdfc73c2368b';

    if (event.type === 'create') {
      // New scope: create a new Notion page
      const scope = data;
      
      const pageBody = {
        parent: { page_id: PARENT_PAGE_ID },
        properties: {
          title: {
            title: [{ text: { content: `Project: ${scope.job_title || 'Untitled'} [${scope.status}]` } }]
          }
        },
        children: [
          {
            object: 'block',
            type: 'heading_2',
            heading_2: { rich_text: [{ text: { content: 'Project Overview' } }] }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: `Contractor: ${scope.contractor_name || 'N/A'}` } }] }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: `Customer: ${scope.customer_name || 'N/A'}` } }] }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: `Cost: ${scope.cost_type === 'hourly' ? `$${scope.cost_amount}/hr` : `$${scope.cost_amount} fixed`}` } }] }
          },
          {
            object: 'block',
            type: 'divider',
            divider: {}
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: { rich_text: [{ text: { content: 'Scope of Work' } }] }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: { rich_text: [{ text: { content: scope.scope_summary || 'No scope summary provided.' } }] }
          }
        ]
      };

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify(pageBody)
      });

      const pageData = await res.json();
      if (!res.ok) {
        console.error('[notionAutoSync] Create page error:', JSON.stringify(pageData));
        return Response.json({ error: pageData.message || 'Failed to create page' }, { status: res.status });
      }

      // Link the Notion page to the scope
      await base44.asServiceRole.entities.ScopeOfWork.update(scope.id, {
        notion_page_url: pageData.url,
        notion_page_id: pageData.id
      });

      console.log(`[notionAutoSync] Created Notion page for scope ${scope.id}`);
      return Response.json({ success: true, pageId: pageData.id });

    } else if (event.type === 'update') {
      // Scope updated: sync status/details to Notion page
      const scope = data;
      
      if (!scope.notion_page_id) {
        console.log(`[notionAutoSync] Scope ${scope.id} has no linked Notion page, skipping sync`);
        return Response.json({ success: true, skipped: true });
      }

      // Update page title with new status
      const updateRes = await fetch(`https://api.notion.com/v1/pages/${scope.notion_page_id}`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify({
          properties: {
            title: { title: [{ text: { content: `Project: ${scope.job_title} [${scope.status}]` } }] }
          }
        })
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        console.error('[notionAutoSync] Update title error:', JSON.stringify(err));
        return Response.json({ error: err.message || 'Failed to update page' }, { status: updateRes.status });
      }

      // Append status change block
      const statusEmoji = { pending_approval:'⏳', approved:'✅', rejected:'❌', cancelled:'🚫', pending_ratings:'⭐', closed:'🏁' };
      await fetch(`https://api.notion.com/v1/blocks/${scope.notion_page_id}/children`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify({
          children: [
            {
              object: 'block',
              type: 'callout',
              callout: {
                rich_text: [{ text: { content: `Status: ${scope.status}` } }],
                icon: { emoji: statusEmoji[scope.status] || '🔄' },
                color: scope.status === 'closed' ? 'green_background' : scope.status === 'rejected' ? 'red_background' : 'blue_background'
              }
            }
          ]
        })
      });

      console.log(`[notionAutoSync] Synced scope ${scope.id} to Notion`);
      return Response.json({ success: true });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('[notionAutoSync] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});