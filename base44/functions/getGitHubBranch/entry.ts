import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { owner, repo } = await req.json();

    if (!owner || !repo) {
      return Response.json({ error: 'owner and repo parameters required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.statusText}`);
    }

    const repoData = await response.json();
    return Response.json({ 
      success: true, 
      branch: repoData.default_branch,
      lastPush: repoData.pushed_at,
      repoUrl: repoData.html_url
    });
  } catch (error) {
    console.error('getGitHubBranch error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});