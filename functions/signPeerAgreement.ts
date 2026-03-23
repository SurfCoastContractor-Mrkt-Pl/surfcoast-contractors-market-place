import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const { collaboration_id, contractor_email } = await req.json();

    if (!collaboration_id || !contractor_email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const base44 = createClientFromRequest(req);

    // Verify user is the contractor signing
    const user = await base44.auth.me();
    if (!user || user.email !== contractor_email) {
      return Response.json(
        { error: 'Unauthorized: Can only sign for your own account' },
        { status: 401 }
      );
    }

    // Fetch collaboration
    const collab = await base44.entities.ProjectCollaboration.filter({
      id: collaboration_id
    });

    if (!collab || collab.length === 0) {
      return Response.json(
        { error: 'Collaboration not found' },
        { status: 404 }
      );
    }

    const collaboration = collab[0];

    // Find collaborator and sign agreement
    const updatedCollaborators = collaboration.collaborators.map(c => {
      if (c.contractor_email === contractor_email) {
        return {
          ...c,
          status: c.status === 'invited' ? 'accepted' : c.status,
          agreement_signed_at: new Date().toISOString()
        };
      }
      return c;
    });

    // Check if all have signed
    const allSigned = updatedCollaborators.every(c => c.agreement_signed_at);

    await base44.entities.ProjectCollaboration.update(collaboration_id, {
      collaborators: updatedCollaborators,
      status: allSigned && updatedCollaborators.every(c => c.status !== 'declined') ? 'active' : 'forming'
    });

    return Response.json({
      success: true,
      message: 'Peer collaboration agreement signed',
      all_signed: allSigned,
      collaboration_status: allSigned ? 'active' : 'forming'
    });
  } catch (error) {
    console.error('Sign agreement error:', error.message);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});