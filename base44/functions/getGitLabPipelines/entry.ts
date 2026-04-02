import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Get GitLab CI/CD pipelines for the connected project
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
      `${gitlabInstanceUrl}/api/v4/projects/${encodeURIComponent(projectPath)}/pipelines?per_page=${limit}`,
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

    const pipelines = await response.json();

    return Response.json({
      pipelines: pipelines.map(pipeline => ({
        id: pipeline.id,
        iid: pipeline.iid,
        status: pipeline.status,
        source: pipeline.source,
        ref: pipeline.ref,
        sha: pipeline.sha,
        webUrl: pipeline.web_url,
        createdAt: pipeline.created_at,
        updatedAt: pipeline.updated_at,
        startedAt: pipeline.started_at,
        finishedAt: pipeline.finished_at,
        committedAt: pipeline.committed_at,
        duration: pipeline.duration
      }))
    });
  } catch (error) {
    console.error('Error fetching pipelines:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});