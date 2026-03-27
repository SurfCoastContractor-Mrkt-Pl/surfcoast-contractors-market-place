import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Notion Project Documentation Function
 * Creates or fetches project-specific pages in Notion for contractors/customers.
 * 
 * Actions:
 *   - createProjectPage: Creates a new project page in Notion
 *   - getProjectPages: Lists all project pages from a Notion database
 *   - createKnowledgeBasePage: Creates a knowledge base article
 *   - getKnowledgeBasePages: Lists all knowledge base articles
 */

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, ...params } = await req.json();

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('notion');

    const notionHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    if (action === 'listPages') {
      // Search for all pages accessible to the integration
      const res = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          filter: { value: 'page', property: 'object' },
          page_size: 50
        })
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[notionProjectDoc] listPages error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to list pages' }, { status: res.status });
      }

      const pages = (data.results || []).map(p => ({
        id: p.id,
        title: p.properties?.title?.title?.[0]?.plain_text || p.object || 'Untitled',
        url: p.url,
        type: p.object,
        last_edited: p.last_edited_time
      }));

      console.log(`[notionProjectDoc] Found ${pages.length} pages`);
      return Response.json({ success: true, pages });

    } else if (action === 'createRootPage') {
      // Creates a top-level page in the workspace (no parent needed)
      const { title, emoji } = params;

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          parent: { type: 'workspace', workspace: true },
          icon: { type: 'emoji', emoji: emoji || '🏄' },
          properties: {
            title: { title: [{ text: { content: title || 'SurfCoast Hub' } }] }
          },
          children: [
            {
              object: 'block', type: 'callout',
              callout: {
                rich_text: [{ text: { content: 'This is the SurfCoast project documentation hub. All project pages and knowledge base articles live here.' } }],
                icon: { emoji: '🏄' },
                color: 'blue_background'
              }
            },
            { object: 'block', type: 'divider', divider: {} },
            { object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: '📁 Project Documentation' } }] } },
            { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: 'Individual project pages will be created here for each scope of work.' } }] } },
            { object: 'block', type: 'heading_1', heading_1: { rich_text: [{ text: { content: '📚 Knowledge Base' } }] } },
            { object: 'block', type: 'paragraph', paragraph: { rich_text: [{ text: { content: 'FAQs, compliance guides, and internal articles live here.' } }] } }
          ]
        })
      });

      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] createRootPage error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to create root page' }, { status: res.status });
      }
      console.log(`[notionProjectDoc] Created root page: ${data.id}`);
      return Response.json({ success: true, pageId: data.id, pageUrl: data.url });

    } else if (action === 'createProjectPage') {
      const { scopeId, jobTitle, contractorName, customerName, costType, costAmount, agreedWorkDate, scopeSummary, parentPageId } = params;

      if (!parentPageId) {
        return Response.json({ error: 'parentPageId is required' }, { status: 400 });
      }

      const body = {
        parent: { page_id: parentPageId },
        properties: {
          title: {
            title: [{ text: { content: `Project: ${jobTitle || 'Untitled'}` } }]
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
            type: 'table_of_contents',
            table_of_contents: { color: 'default' }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: `Contractor: ${contractorName || 'N/A'}` } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: `Customer: ${customerName || 'N/A'}` } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: `Cost: ${costType === 'hourly' ? `$${costAmount}/hr` : `$${costAmount} fixed`}` } }]
            }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: `Work Date: ${agreedWorkDate || 'TBD'}` } }]
            }
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
            paragraph: {
              rich_text: [{ text: { content: scopeSummary || 'No scope summary provided.' } }]
            }
          },
          {
            object: 'block',
            type: 'heading_2',
            heading_2: { rich_text: [{ text: { content: 'Notes & Updates' } }] }
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: 'Add project notes and updates here.' } }]
            }
          }
        ]
      };

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[notionProjectDoc] createProjectPage error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to create Notion page' }, { status: res.status });
      }

      console.log(`[notionProjectDoc] Created project page for scope ${scopeId}: ${data.id}`);
      return Response.json({ success: true, pageId: data.id, pageUrl: data.url });

    } else if (action === 'getProjectPages') {
      const { parentPageId } = params;

      if (!parentPageId) {
        return Response.json({ error: 'parentPageId is required' }, { status: 400 });
      }

      const res = await fetch(`https://api.notion.com/v1/blocks/${parentPageId}/children?page_size=50`, {
        headers: notionHeaders
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[notionProjectDoc] getProjectPages error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to fetch pages' }, { status: res.status });
      }

      const pages = (data.results || []).filter(b => b.type === 'child_page').map(b => ({
        id: b.id,
        title: b.child_page?.title || 'Untitled',
        url: `https://notion.so/${b.id.replace(/-/g, '')}`
      }));

      return Response.json({ success: true, pages });

    } else if (action === 'createKnowledgeBasePage') {
      const { title, category, content, parentPageId } = params;

      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Only admins can create knowledge base pages' }, { status: 403 });
      }

      if (!parentPageId) {
        return Response.json({ error: 'parentPageId is required' }, { status: 400 });
      }

      const body = {
        parent: { page_id: parentPageId },
        properties: {
          title: {
            title: [{ text: { content: title || 'Untitled Article' } }]
          }
        },
        children: [
          {
            object: 'block',
            type: 'callout',
            callout: {
              rich_text: [{ text: { content: `Category: ${category || 'General'}` } }],
              icon: { emoji: '📚' },
              color: 'blue_background'
            }
          },
          {
            object: 'block',
            type: 'divider',
            divider: {}
          },
          {
            object: 'block',
            type: 'paragraph',
            paragraph: {
              rich_text: [{ text: { content: content || 'Add your content here.' } }]
            }
          }
        ]
      };

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[notionProjectDoc] createKnowledgeBasePage error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to create KB page' }, { status: res.status });
      }

      console.log(`[notionProjectDoc] Created KB page: ${data.id}`);
      return Response.json({ success: true, pageId: data.id, pageUrl: data.url });

    } else if (action === 'getKnowledgeBasePages') {
      const { parentPageId } = params;

      if (!parentPageId) {
        return Response.json({ error: 'parentPageId is required' }, { status: 400 });
      }

      const res = await fetch(`https://api.notion.com/v1/blocks/${parentPageId}/children?page_size=100`, {
        headers: notionHeaders
      });

      const data = await res.json();

      if (!res.ok) {
        console.error('[notionProjectDoc] getKnowledgeBasePages error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to fetch KB pages' }, { status: res.status });
      }

      const pages = (data.results || []).filter(b => b.type === 'child_page').map(b => ({
        id: b.id,
        title: b.child_page?.title || 'Untitled',
        url: `https://notion.so/${b.id.replace(/-/g, '')}`
      }));

      return Response.json({ success: true, pages });

    } else {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

  } catch (error) {
    console.error('[notionProjectDoc] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});