import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Notion Auto-Sync Function
 * Triggered on ScopeOfWork create/update OR ProjectMilestone update events
 * Automatically creates/updates linked Notion project pages with milestone tracking
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { event, data, old_data } = await req.json();

    if (!data || !data.id) {
      return Response.json({ error: 'Invalid event data' }, { status: 400 });
    }

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is authorized (contractor or customer involved, or admin)
    const isAuthorized = user.role === 'admin' || 
      data.contractor_email === user.email || 
      data.customer_email === user.email;

    if (!isAuthorized) {
      return Response.json({ error: 'Forbidden: You do not have access to this scope' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('notion');
    const notionHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    const rawParentPageId = Deno.env.get('NOTION_PROJECT_PARENT_PAGE_ID');
    if (!rawParentPageId) {
      return Response.json({ error: 'NOTION_PROJECT_PARENT_PAGE_ID environment variable not set' }, { status: 500 });
    }

    // Normalize to UUID format — strips any non-hex prefix (e.g. "Finalized-Docs-")
    const hexOnly = rawParentPageId.replace(/-/g, '').match(/[0-9a-f]{32}$/i)?.[0];
    if (!hexOnly) {
      return Response.json({ error: `NOTION_PROJECT_PARENT_PAGE_ID is not a valid Notion page ID: ${rawParentPageId}` }, { status: 500 });
    }
    const PARENT_PAGE_ID = `${hexOnly.slice(0,8)}-${hexOnly.slice(8,12)}-${hexOnly.slice(12,16)}-${hexOnly.slice(16,20)}-${hexOnly.slice(20)}`;
    console.log(`[notionAutoSync] Using parent page ID: ${PARENT_PAGE_ID}`);

    // Handle ScopeOfWork events
    if (event.entity_name === 'ScopeOfWork') {
      if (event.type === 'create') {
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
            },
            {
              object: 'block',
              type: 'heading_2',
              heading_2: { rich_text: [{ text: { content: 'Milestones' } }] }
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

        await base44.asServiceRole.entities.ScopeOfWork.update(scope.id, {
          notion_page_url: pageData.url,
          notion_page_id: pageData.id
        });

        console.log(`[notionAutoSync] Created Notion page for scope ${scope.id}`);
        return Response.json({ success: true, pageId: pageData.id });

      } else if (event.type === 'update') {
        const scope = data;
        
        if (!scope.notion_page_id) {
          console.log(`[notionAutoSync] Scope ${scope.id} has no linked Notion page, skipping sync`);
          return Response.json({ success: true, skipped: true });
        }

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
    } else if (event.entity_name === 'ProjectMilestone' && event.type === 'update') {
      // Handle milestone completion: append status block to Notion page
      const milestone = data;
      const oldMilestone = old_data;

      if (milestone.status === 'completed' && oldMilestone?.status !== 'completed') {
        const scope = await base44.asServiceRole.entities.ScopeOfWork.get(milestone.scope_id);

        if (scope && scope.notion_page_id) {
          await fetch(`https://api.notion.com/v1/blocks/${scope.notion_page_id}/children`, {
            method: 'PATCH',
            headers: notionHeaders,
            body: JSON.stringify({
              children: [
                {
                  object: 'block',
                  type: 'callout',
                  callout: {
                    rich_text: [{ text: { content: `Milestone Completed: ${milestone.title}` } }],
                    icon: { emoji: '✅' },
                    color: 'green_background'
                  }
                }
              ]
            })
          });
          console.log(`[notionAutoSync] Appended milestone completion for scope ${scope.id} to Notion`);
        } else {
          console.log(`[notionAutoSync] Milestone ${milestone.id} not linked to Notion, skipping`);
        }
      }
      return Response.json({ success: true });
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('[notionAutoSync] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});