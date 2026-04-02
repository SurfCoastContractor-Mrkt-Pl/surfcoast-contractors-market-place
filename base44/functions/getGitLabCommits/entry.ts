import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { projectId, per_page = 10 } = await req.json();

    if (!projectId) {
      return Response.json({ error: 'projectId parameter required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gitlab');

    const response = await fetch(
      `https://gitlab.com/api/v4/projects/${projectId}/repository/commits?per_page=${per_page}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitLab API error: ${response.statusText}`);
    }

    const commits = await response.json();
    return Response.json({ success: true, commits });
  } catch (error) {
    console.error('getGitLabCommits error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});