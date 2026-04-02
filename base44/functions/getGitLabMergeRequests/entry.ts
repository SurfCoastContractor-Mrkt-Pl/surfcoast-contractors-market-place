import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Get GitLab merge requests for the connected project
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
      `${gitlabInstanceUrl}/api/v4/projects/${encodeURIComponent(projectPath)}/merge_requests?state=${state}&per_page=${limit}`,
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

    const mrs = await response.json();

    return Response.json({
      mergeRequests: mrs.map(mr => ({
        id: mr.id,
        iid: mr.iid,
        title: mr.title,
        description: mr.description,
        state: mr.state,
        merged: mr.merged,
        mergedAt: mr.merged_at,
        mergedBy: mr.merged_by ? { id: mr.merged_by.id, name: mr.merged_by.name } : null,
        sourceBranch: mr.source_branch,
        targetBranch: mr.target_branch,
        author: { id: mr.author.id, name: mr.author.name, avatar: mr.author.avatar_url },
        assignee: mr.assignee ? { id: mr.assignee.id, name: mr.assignee.name } : null,
        createdAt: mr.created_at,
        updatedAt: mr.updated_at,
        webUrl: mr.web_url,
        draft: mr.draft,
        workInProgress: mr.work_in_progress,
        labels: mr.labels || []
      }))
    });
  } catch (error) {
    console.error('Error fetching merge requests:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});