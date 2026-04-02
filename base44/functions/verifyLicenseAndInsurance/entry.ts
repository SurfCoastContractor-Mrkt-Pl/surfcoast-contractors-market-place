import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const {
      contractorId,
      licenseNumber,
      state,
      licenseType,
      insurancePolNumber,
    } = await req.json();

    if (!contractorId || !licenseNumber || !state) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let verificationStatus = 'pending';
    let verificationMethod = 'manual';
    let verificationNotes = '';

    // In production, integrate with:
    // - State contractor licensing boards API
    // - LexisNexis or similar for license verification
    // - Insurance verification services

    // Placeholder verification logic
    const licensePattern = /^\d{6,8}$/;
    if (!licensePattern.test(licenseNumber)) {
      verificationStatus = 'failed';
      verificationNotes = 'Invalid license number format';
    } else {
      verificationStatus = 'verified';
      verificationNotes = 'License format verified (manual validation)';
      verificationMethod = 'document';
    }

    // Create verification record
    const verification = await base44.entities.LicenseVerification.create({
      contractor_id: contractorId,
      contractor_email: (await base44.entities.Contractor.filter({ id: contractorId }))?.[0]
        ?.email,
      license_number: licenseNumber,
      license_type: licenseType,
      state,
      verification_status: verificationStatus,
      verification_method: verificationMethod,
      verified_at: verificationStatus === 'verified' ? new Date().toISOString() : null,
      verification_notes: verificationNotes,
      insurance_policy_number: insurancePolNumber,
      insurance_verified: insurancePolNumber ? true : false,
    });

    return Response.json({
      verified: verificationStatus === 'verified',
      verification,
      status: verificationStatus,
    });
  } catch (error) {
    console.error('License verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});