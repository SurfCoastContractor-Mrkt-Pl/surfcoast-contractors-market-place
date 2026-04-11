import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const authUser = await base44.auth.me();
    if (!authUser || authUser.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const githubUser = await response.json();
    return Response.json({ success: true, user: githubUser });
  } catch (error) {
    console.error('getGitHubUser error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});