import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { owner, repo, filePath, content, message } = await req.json();

    if (!owner || !repo || !filePath || content === undefined || !message) {
      return Response.json({ 
        error: 'owner, repo, filePath, content, and message are required' 
      }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getConnection('github');

    // Get current file to retrieve its SHA for update
    let sha;
    try {
      const getResponse = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        }
      );

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File doesn't exist yet, that's fine
    }

    // Encode content to base64
    const encodedContent = btoa(unescape(encodeURIComponent(content)));

    // Create or update file
    const commitResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
          content: encodedContent,
          ...(sha && { sha }),
        }),
      }
    );

    if (!commitResponse.ok) {
      const error = await commitResponse.json();
      throw new Error(`GitHub API error: ${error.message}`);
    }

    const result = await commitResponse.json();
    return Response.json({ 
      success: true, 
      commit: result.commit.sha,
      message: `Committed to ${filePath}: ${message}`
    });
  } catch (error) {
    console.error('autoBackupToGitHub error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});