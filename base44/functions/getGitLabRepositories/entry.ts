import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Get GitLab repositories (for the connected project)
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

    // Get project details (includes repo info)
    const response = await fetch(
      `${gitlabInstanceUrl}/api/v4/projects/${encodeURIComponent(projectPath)}`,
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

    const project = await response.json();

    return Response.json({
      repositories: [{
        id: project.id,
        name: project.name,
        path: project.path_with_namespace,
        description: project.description,
        url: project.web_url,
        defaultBranch: project.default_branch,
        visibility: project.visibility,
        createdAt: project.created_at,
        lastActivityAt: project.last_activity_at,
        starCount: project.star_count,
        forksCount: project.forks_count
      }]
    });
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});