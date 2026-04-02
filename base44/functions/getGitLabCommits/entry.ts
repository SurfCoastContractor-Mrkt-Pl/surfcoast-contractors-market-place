import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Get recent GitLab commits for the connected project
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
    const limit = 20;

    const response = await fetch(
      `${gitlabInstanceUrl}/api/v4/projects/${encodeURIComponent(projectPath)}/repository/commits?per_page=${limit}`,
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

    const commits = await response.json();

    return Response.json({
      commits: commits.map(commit => ({
        id: commit.id,
        shortId: commit.short_id,
        title: commit.title,
        message: commit.message,
        authorName: commit.author_name,
        authorEmail: commit.author_email,
        committerName: commit.committer_name,
        committerEmail: commit.committer_email,
        createdAt: commit.created_at,
        parentIds: commit.parent_ids,
        webUrl: commit.web_url
      }))
    });
  } catch (error) {
    console.error('Error fetching commits:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});