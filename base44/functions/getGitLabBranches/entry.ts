import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Get GitLab branches for the connected project
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
    const limit = 30;

    const response = await fetch(
      `${gitlabInstanceUrl}/api/v4/projects/${encodeURIComponent(projectPath)}/repository/branches?per_page=${limit}`,
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

    const branches = await response.json();

    return Response.json({
      branches: branches.map(branch => ({
        name: branch.name,
        protected: branch.protected,
        defaultBranch: branch.default,
        merged: branch.merged,
        commit: {
          id: branch.commit.id,
          shortId: branch.commit.short_id,
          title: branch.commit.title,
          message: branch.commit.message,
          authorName: branch.commit.author_name,
          createdAt: branch.commit.created_at,
          webUrl: branch.commit.web_url
        }
      }))
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});