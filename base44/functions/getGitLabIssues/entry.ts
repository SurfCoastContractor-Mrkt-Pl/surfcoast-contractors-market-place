import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Get GitLab issues for the connected project
 * Admin-only function
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const gitlabToken = Deno.env.get('GITLAB_API_TOKEN');
    const gitlabInstanceUrl = Deno.env.get('GITLAB_INSTANCE_URL');
    const gitlabProjectUrl = Deno.env.get('GITLAB_PROJECT_URL');

    if (!gitlabToken || !gitlabInstanceUrl || !gitlabProjectUrl) {
      return Response.json({ error: 'GitLab not configured' }, { status: 400 });
    }

    const projectPath = gitlabProjectUrl.split('/').slice(-2).join('/');
    const url = new URL(req.url);
    const state = url.searchParams.get('state') || 'opened';
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const response = await fetch(
      `${gitlabInstanceUrl}/api/v4/projects/${encodeURIComponent(projectPath)}/issues?state=${state}&per_page=${limit}`,
      {
        headers: {
          'PRIVATE-TOKEN': gitlabToken,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.status}`);
    }

    const issues = await response.json();

    return Response.json({
      issues: issues.map(issue => ({
        id: issue.id,
        iid: issue.iid,
        title: issue.title,
        description: issue.description,
        state: issue.state,
        severity: issue.severity,
        assignee: issue.assignee ? { id: issue.assignee.id, name: issue.assignee.name, avatar: issue.assignee.avatar_url } : null,
        author: { id: issue.author.id, name: issue.author.name, avatar: issue.author.avatar_url },
        createdAt: issue.created_at,
        updatedAt: issue.updated_at,
        closedAt: issue.closed_at,
        webUrl: issue.web_url,
        labels: issue.labels || []
      }))
    });
  } catch (error) {
    console.error('Error fetching issues:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});