import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Test GitLab connection by verifying the API token and retrieving project info
 * Admin-only function
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only check
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const gitlabToken = Deno.env.get('GITLAB_API_TOKEN');
    const gitlabInstanceUrl = Deno.env.get('GITLAB_INSTANCE_URL');
    const gitlabProjectUrl = Deno.env.get('GITLAB_PROJECT_URL');

    if (!gitlabToken || !gitlabInstanceUrl || !gitlabProjectUrl) {
      return Response.json({
        connected: false,
        error: 'GitLab credentials not configured. Please set GITLAB_API_TOKEN, GITLAB_INSTANCE_URL, and GITLAB_PROJECT_URL in environment variables.',
        details: null
      });
    }

    // Extract project path from URL (e.g., "mygroup/myproject")
    const urlParts = gitlabProjectUrl.split('/');
    const projectPath = urlParts.slice(-2).join('/');

    // Test API connection
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
      const errorData = await response.text();
      console.error('GitLab API Error:', response.status, errorData);
      return Response.json({
        connected: false,
        error: `GitLab API returned ${response.status}. Check your token and project URL.`,
        details: {
          status: response.status,
          message: response.statusText
        }
      });
    }

    const projectData = await response.json();

    // Test webhook configuration (optional - just check if we can read webhooks)
    const webhookResponse = await fetch(
      `${gitlabInstanceUrl}/api/v4/projects/${encodeURIComponent(projectPath)}/hooks`,
      {
        headers: {
          'PRIVATE-TOKEN': gitlabToken,
          'Content-Type': 'application/json'
        }
      }
    );

    let webhooks = [];
    if (webhookResponse.ok) {
      webhooks = await webhookResponse.json();
    }

    return Response.json({
      connected: true,
      error: null,
      details: {
        projectId: projectData.id,
        projectName: projectData.name,
        projectPath: projectData.path_with_namespace,
        description: projectData.description,
        visibility: projectData.visibility,
        createdAt: projectData.created_at,
        lastActivityAt: projectData.last_activity_at,
        webhooksConfigured: webhooks.length
      }
    });
  } catch (error) {
    console.error('GitLab connection test error:', error);
    return Response.json({
      connected: false,
      error: error.message,
      details: null
    }, { status: 500 });
  }
});