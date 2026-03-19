import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Must be authenticated
    const user = await base44.auth.me().catch(() => null);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const {
      collaboration_id,
      contractor_email,
      contractor_name,
      contractor_id
    } = await req.json();

    if (!collaboration_id || !contractor_email) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if contractor is payment compliant
    const contractors = await base44.entities.Contractor.filter({
      email: contractor_email
    });

    if (!contractors || contractors.length === 0) {
      return Response.json(
        { error: 'Contractor not found' },
        { status: 404 }
      );
    }

    const contractor = contractors[0];

    if (contractor.payment_compliant === false) {
      return Response.json(
        {
          error: 'Contractor account is locked due to payment compliance issues',
          can_invite: false
        },
        { status: 400 }
      );
    }

    // Fetch collaboration
    const collab = await base44.asServiceRole.entities.ProjectCollaboration.filter({
      id: collaboration_id
    });

    if (!collab || collab.length === 0) {
      return Response.json(
        { error: 'Collaboration not found' },
        { status: 404 }
      );
    }

    const collaboration = collab[0];

    // Check if already invited
    const alreadyInvited = collaboration.collaborators.some(
      c => c.contractor_email === contractor_email
    );

    if (alreadyInvited) {
      return Response.json(
        { error: 'Contractor already invited to this collaboration' },
        { status: 400 }
      );
    }

    // Add collaborator
    const updatedCollaborators = [
      ...collaboration.collaborators,
      {
        contractor_id: contractor_id || contractor.id,
        contractor_email,
        contractor_name: contractor_name || contractor.name,
        status: 'invited',
        scope_id: null,
        joined_at: null,
        agreement_signed_at: null
      }
    ];

    await base44.asServiceRole.entities.ProjectCollaboration.update(
      collaboration_id,
      { collaborators: updatedCollaborators }
    );

    return Response.json({
      success: true,
      message: `${contractor_name || contractor.name} has been invited to the collaboration`,
      collaboration_id
    });
  } catch (error) {
    console.error('Invite collaborator error:', error.message);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});