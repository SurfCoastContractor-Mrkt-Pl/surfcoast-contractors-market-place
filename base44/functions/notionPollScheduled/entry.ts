import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Scheduled function: polls all ScopeOfWork records with linked Notion pages
 * and logs any pages that were edited in Notion more recently than the app record.
 * Intended to run on a schedule (e.g., daily).
 */

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('notion');
    const notionHeaders = {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    };

    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ notion_page_id: { $exists: true } });
    const updatedInNotion = [];

    for (const scope of scopes) {
      if (!scope.notion_page_id) continue;
      const res = await fetch(`https://api.notion.com/v1/pages/${scope.notion_page_id}`, { headers: notionHeaders });
      if (!res.ok) continue;
      const page = await res.json();
      const notionEdited = new Date(page.last_edited_time);
      const scopeUpdated = new Date(scope.updated_date);
      if (notionEdited > scopeUpdated) {
        updatedInNotion.push({ scopeId: scope.id, jobTitle: scope.job_title, notionEdited: page.last_edited_time });
        console.log(`[notionPoll] Notion edit detected for scope ${scope.id} ("${scope.job_title}") — Notion: ${page.last_edited_time}`);
      }
    }

    console.log(`[notionPoll] Checked ${scopes.length} scopes. ${updatedInNotion.length} had Notion edits.`);
    return Response.json({ success: true, checked: scopes.length, updated_in_notion: updatedInNotion });

  } catch (error) {
    console.error('[notionPoll] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});