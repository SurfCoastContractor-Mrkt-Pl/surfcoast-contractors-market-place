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

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
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

    } else if (action === 'searchPages') {
      const { query } = params;
      const res = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({
          query: query || '',
          filter: { value: 'page', property: 'object' },
          page_size: 20
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] searchPages error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Search failed' }, { status: res.status });
      }
      const pages = (data.results || []).map(p => ({
        id: p.id,
        title: p.properties?.title?.title?.[0]?.plain_text || p.properties?.Name?.title?.[0]?.plain_text || 'Untitled',
        url: p.url,
        last_edited: p.last_edited_time
      }));
      return Response.json({ success: true, pages });

    } else if (action === 'appendToPage') {
      // Append blocks to an existing page (edit/update)
      const { pageId, content } = params;
      if (!pageId) return Response.json({ error: 'pageId is required' }, { status: 400 });
      if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

      const res = await fetch(`https://api.notion.com/v1/blocks/${pageId}/children`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify({
          children: [
            {
              object: 'block',
              type: 'callout',
              callout: {
                rich_text: [{ text: { content: `Update — ${new Date().toLocaleDateString()}: ${content}` } }],
                icon: { emoji: '📝' },
                color: 'yellow_background'
              }
            }
          ]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] appendToPage error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to append' }, { status: res.status });
      }
      return Response.json({ success: true });

    } else if (action === 'linkScopeToPage') {
      const { scopeId, notionPageUrl, notionPageId } = params;
      if (!scopeId || !notionPageUrl) return Response.json({ error: 'scopeId and notionPageUrl required' }, { status: 400 });
      await base44.asServiceRole.entities.ScopeOfWork.update(scopeId, {
        notion_page_url: notionPageUrl,
        notion_page_id: notionPageId
      });
      return Response.json({ success: true });

    } else if (action === 'updatePageTitle') {
      // Update page title and/or icon
      const { pageId, title, emoji } = params;
      if (!pageId) return Response.json({ error: 'pageId is required' }, { status: 400 });
      if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

      const body = { properties: { title: { title: [{ text: { content: title } }] } } };
      if (emoji) body.icon = { type: 'emoji', emoji };

      const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] updatePageTitle error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to update page' }, { status: res.status });
      }
      return Response.json({ success: true, pageUrl: data.url });

    } else if (action === 'archivePage') {
      // Archive (soft-delete) a page
      const { pageId } = params;
      if (!pageId) return Response.json({ error: 'pageId is required' }, { status: 400 });
      if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

      const res = await fetch(`https://api.notion.com/v1/pages/${pageId}`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify({ archived: true })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] archivePage error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to archive page' }, { status: res.status });
      }
      return Response.json({ success: true });

    } else if (action === 'listDatabases') {
      // List all Notion databases accessible to the integration
      const res = await fetch('https://api.notion.com/v1/search', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({ filter: { value: 'database', property: 'object' }, page_size: 20 })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] listDatabases error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to list databases' }, { status: res.status });
      }
      const databases = (data.results || []).map(db => ({
        id: db.id,
        title: db.title?.[0]?.plain_text || 'Untitled Database',
        url: db.url
      }));
      return Response.json({ success: true, databases });

    } else if (action === 'queryDatabase') {
      // Query rows from a Notion database
      const { databaseId, filter, sorts, pageSize } = params;
      if (!databaseId) return Response.json({ error: 'databaseId is required' }, { status: 400 });

      const body = { page_size: pageSize || 50 };
      if (filter) body.filter = filter;
      if (sorts) body.sorts = sorts;

      const res = await fetch(`https://api.notion.com/v1/databases/${databaseId}/query`, {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] queryDatabase error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to query database' }, { status: res.status });
      }
      const rows = (data.results || []).map(row => {
        // Flatten properties for easy use
        const props = {};
        for (const [key, val] of Object.entries(row.properties || {})) {
          if (val.type === 'title') props[key] = val.title?.[0]?.plain_text || '';
          else if (val.type === 'rich_text') props[key] = val.rich_text?.[0]?.plain_text || '';
          else if (val.type === 'select') props[key] = val.select?.name || '';
          else if (val.type === 'multi_select') props[key] = val.multi_select?.map(s => s.name) || [];
          else if (val.type === 'date') props[key] = val.date?.start || '';
          else if (val.type === 'checkbox') props[key] = val.checkbox;
          else if (val.type === 'number') props[key] = val.number;
          else if (val.type === 'url') props[key] = val.url;
          else if (val.type === 'email') props[key] = val.email;
          else props[key] = null;
        }
        return { id: row.id, url: row.url, last_edited: row.last_edited_time, properties: props };
      });
      return Response.json({ success: true, rows, has_more: data.has_more });

    } else if (action === 'createDatabaseRow') {
      // Create a new row in a Notion database
      const { databaseId, properties } = params;
      if (!databaseId || !properties) return Response.json({ error: 'databaseId and properties required' }, { status: 400 });
      if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify({ parent: { database_id: databaseId }, properties })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] createDatabaseRow error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to create row' }, { status: res.status });
      }
      return Response.json({ success: true, rowId: data.id, rowUrl: data.url });

    } else if (action === 'createRichPage') {
      // Create a page with advanced block types (toggles, code, columns callout, etc.)
      const { parentPageId, title, emoji, blocks } = params;
      if (!parentPageId) return Response.json({ error: 'parentPageId is required' }, { status: 400 });
      if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

      const body = {
        parent: { page_id: parentPageId },
        icon: emoji ? { type: 'emoji', emoji } : undefined,
        properties: { title: { title: [{ text: { content: title || 'Untitled' } }] } },
        children: blocks || []
      };

      const res = await fetch('https://api.notion.com/v1/pages', {
        method: 'POST',
        headers: notionHeaders,
        body: JSON.stringify(body)
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] createRichPage error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Failed to create rich page' }, { status: res.status });
      }
      return Response.json({ success: true, pageId: data.id, pageUrl: data.url });

    } else if (action === 'syncScopeToNotion') {
      // Two-way: push current scope status/details to its linked Notion page
      const { scopeId } = params;
      if (!scopeId) return Response.json({ error: 'scopeId is required' }, { status: 400 });

      const scope = await base44.asServiceRole.entities.ScopeOfWork.get(scopeId);
      if (!scope?.notion_page_id) return Response.json({ error: 'No Notion page linked to this scope' }, { status: 404 });

      // Append a sync status block
      const statusEmoji = { pending_approval:'⏳', approved:'✅', rejected:'❌', cancelled:'🚫', pending_ratings:'⭐', closed:'🏁' };
      const res = await fetch(`https://api.notion.com/v1/blocks/${scope.notion_page_id}/children`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify({
          children: [
            {
              object: 'block', type: 'callout',
              callout: {
                rich_text: [{ text: { content: `Sync — ${new Date().toLocaleDateString()}: Status changed to "${scope.status}"` } }],
                icon: { emoji: statusEmoji[scope.status] || '🔄' },
                color: scope.status === 'closed' ? 'green_background' : scope.status === 'rejected' ? 'red_background' : 'blue_background'
              }
            }
          ]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        console.error('[notionProjectDoc] syncScopeToNotion error:', JSON.stringify(data));
        return Response.json({ error: data.message || 'Sync failed' }, { status: res.status });
      }
      // Also update page title to reflect latest status
      await fetch(`https://api.notion.com/v1/pages/${scope.notion_page_id}`, {
        method: 'PATCH',
        headers: notionHeaders,
        body: JSON.stringify({
          properties: { title: { title: [{ text: { content: `Project: ${scope.job_title} [${scope.status}]` } }] } }
        })
      });
      return Response.json({ success: true });

    } else if (action === 'pollNotionForUpdates') {
      // Workflow: scan all scopes with notion links and check if Notion page was updated
      // If last_edited on Notion is newer than our updated_date, append a note to scope
      if (user.role !== 'admin') return Response.json({ error: 'Admins only' }, { status: 403 });

      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ notion_page_id: { $exists: true } });
      const results = [];

      for (const scope of scopes) {
        if (!scope.notion_page_id) continue;
        const pageRes = await fetch(`https://api.notion.com/v1/pages/${scope.notion_page_id}`, { headers: notionHeaders });
        if (!pageRes.ok) continue;
        const pageData = await pageRes.json();
        const notionEdited = new Date(pageData.last_edited_time);
        const scopeUpdated = new Date(scope.updated_date);
        if (notionEdited > scopeUpdated) {
          results.push({ scopeId: scope.id, jobTitle: scope.job_title, notionEdited: pageData.last_edited_time });
        }
      }

      return Response.json({ success: true, updated_in_notion: results });

    } else {
      return Response.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }

  } catch (error) {
    console.error('[notionProjectDoc] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});