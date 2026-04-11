import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gitlab');

    const response = await fetch(
      'https://gitlab.com/api/v4/projects?owned=true&per_page=20&order_by=updated_at',
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

    const projects = await response.json();
    return Response.json({ success: true, projects });
  } catch (error) {
    console.error('getGitLabProjects error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});