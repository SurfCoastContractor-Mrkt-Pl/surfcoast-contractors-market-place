import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractor_email, is_collaboration } = await req.json();

    if (!contractor_email || is_collaboration === undefined) {
      return Response.json(
        { error: 'Missing required fields: contractor_email, is_collaboration' },
        { status: 400 }
      );
    }

    // Users can only check eligibility for their own account
    if (user.email !== contractor_email) {
      return Response.json({ error: 'Forbidden: Can only check eligibility for your own account' }, { status: 403 });
    }

    // Fetch contractor
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

    // Check payment compliance
    if (contractor.payment_compliant === false) {
      return Response.json(
        {
          eligible: false,
          reason: 'Account locked due to off-platform payment detected. All payments must process through SurfCoast.',
          can_view_profile: true,
          can_apply_jobs: false
        },
        { status: 200 }
      );
    }

    // If collaboration, check insurance requirement
    if (is_collaboration) {
      const needs_insurance =
        contractor.is_licensed_sole_proprietor === true ||
        (contractor.profile_tier === 'licensed' && contractor.license_verified === true);

      if (needs_insurance) {
        const has_insurance =
          contractor.insurance_document_url &&
          contractor.insurance_expiry &&
          new Date(contractor.insurance_expiry) > new Date();

        if (!has_insurance) {
          return Response.json(
            {
              eligible: false,
              reason: 'Active general liability insurance required for collaboration work.',
              missing_insurance: true,
              can_view_profile: true,
              can_apply_jobs: true,
              can_collaborate: false
            },
            { status: 200 }
          );
        }
      }
    }

    // All checks passed
    return Response.json(
      {
        eligible: true,
        can_view_profile: true,
        can_apply_jobs: true,
        can_collaborate: true,
        requires_insurance_for_collab: is_collaboration &&
          (contractor.is_licensed_sole_proprietor === true ||
            contractor.profile_tier === 'licensed')
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Collaboration eligibility check error:', error.message);
    return Response.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
});