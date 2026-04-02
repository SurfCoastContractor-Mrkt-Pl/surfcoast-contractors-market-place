import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Mock state board database — replace with real API calls when credentials available
const MOCK_LICENSES = {
  'CA-12345': { state: 'CA', contractor: 'John Smith', active: true, exp: '2026-12-31' },
  'TX-67890': { state: 'TX', contractor: 'Jane Doe', active: true, exp: '2026-06-30' },
  'FL-11111': { state: 'FL', contractor: 'Bob Wilson', active: false, exp: '2024-01-01' },
  'NY-22222': { state: 'NY', contractor: 'Alice Brown', active: true, exp: '2027-03-15' },
};

const MOCK_INSURANCE = {
  'INS-001': { provider: 'State Farm', coverage: 100000, active: true, exp: '2026-08-30' },
  'INS-002': { provider: 'Allstate', coverage: 50000, active: true, exp: '2025-11-15' },
  'INS-003': { provider: 'Progressive', coverage: 75000, active: false, exp: '2024-02-28' },
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractorId, licenseNumber, state, insurancePolicyNumber } = await req.json();

    if (!contractorId || !licenseNumber || !state) {
      return Response.json(
        { error: 'contractorId, licenseNumber, and state are required' },
        { status: 400 }
      );
    }

    // Fetch contractor
    const contractors = await base44.entities.Contractor.filter({ id: contractorId });
    if (!contractors?.[0]) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const contractor = contractors[0];
    const verificationId = `LV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const verifiedAt = new Date().toISOString();

    // MOCK: License verification (replace with real LexisNexis/state board API)
    let licenseStatus = 'unverified';
    let licenseDetails = null;

    // Check mock database
    const mockRecord = MOCK_LICENSES[licenseNumber];
    if (mockRecord && mockRecord.state === state) {
      const expDate = new Date(mockRecord.exp);
      const isExpired = expDate < new Date();
      licenseStatus = mockRecord.active && !isExpired ? 'verified' : 'expired';
      licenseDetails = {
        licenseNumber,
        state,
        name: mockRecord.contractor,
        issuedDate: new Date(new Date(mockRecord.exp).getFullYear() - 3).toISOString().split('T')[0],
        expirationDate: mockRecord.exp,
        status: licenseStatus,
      };
    } else {
      // Simulate unverified (would hit real API here)
      licenseDetails = {
        licenseNumber,
        state,
        status: 'failed_verification',
        errorMessage: 'License not found in state board database (mock). Replace with real API call.',
      };
    }

    // MOCK: Insurance verification
    let insuranceStatus = 'unverified';
    let insuranceDetails = null;

    if (insurancePolicyNumber) {
      const mockInsurance = MOCK_INSURANCE[insurancePolicyNumber];
      if (mockInsurance) {
        const expDate = new Date(mockInsurance.exp);
        const isExpired = expDate < new Date();
        insuranceStatus = mockInsurance.active && !isExpired ? 'verified' : 'expired';
        insuranceDetails = {
          policyNumber: insurancePolicyNumber,
          provider: mockInsurance.provider,
          coverageAmount: mockInsurance.coverage,
          expirationDate: mockInsurance.exp,
          status: insuranceStatus,
        };
      }
    }

    // Create LicenseVerification record
    const verification = {
      contractor_id: contractorId,
      contractor_email: contractor.email,
      license_number: licenseNumber,
      license_type: 'contractor',
      state,
      verification_status: licenseStatus,
      verification_method: 'mock',
      verified_at: licenseStatus !== 'unverified' ? verifiedAt : null,
      expiration_date: licenseDetails?.expirationDate,
      insurance_company: insuranceDetails?.provider,
      insurance_policy_number: insurancePolicyNumber,
      insurance_verified: insuranceStatus === 'verified',
      verification_notes: licenseDetails?.errorMessage || `Verified via mock service on ${verifiedAt}`,
    };

    const created = await base44.entities.LicenseVerification.create(verification);

    // Update contractor profile with verification status
    if (licenseStatus === 'verified') {
      await base44.entities.Contractor.update(contractorId, {
        license_verified: true,
        license_status: 'active',
        license_verified_at: verifiedAt,
        license_verification_method: 'mock',
      });
    }

    return Response.json({
      success: true,
      verificationId,
      license: licenseDetails,
      insurance: insuranceDetails,
      created,
      note: 'Using MOCK data. Replace MOCK_LICENSES & MOCK_INSURANCE with real API calls (LexisNexis, state boards) when credentials available.',
    });
  } catch (error) {
    console.error('License verification error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});