import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const authUser = await base44.auth.me();
    if (!authUser || authUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('gitlab');

    const response = await fetch(
      'https://gitlab.com/api/v4/user',
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

    const gitlabUser = await response.json();
    return Response.json({ success: true, user: gitlabUser });
  } catch (error) {
    console.error('getGitLabUser error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});