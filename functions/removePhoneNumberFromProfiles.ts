import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    // Admin-only function
    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { phoneNumber } = body;

    if (!phoneNumber) {
      return Response.json({ error: 'Phone number required' }, { status: 400 });
    }

    const normalizedPhone = phoneNumber.replace(/\D/g, '');
    let removedCustomerCount = 0;
    let removedContractorCount = 0;

    // Remove from CustomerProfile
    const customerProfiles = await base44.asServiceRole.entities.CustomerProfile.list();
    for (const profile of customerProfiles) {
      if (profile.phone && profile.phone.replace(/\D/g, '') === normalizedPhone) {
        await base44.asServiceRole.entities.CustomerProfile.update(profile.id, { phone: null });
        removedCustomerCount++;
      }
    }

    // Remove from Contractor
    const contractors = await base44.asServiceRole.entities.Contractor.list();
    for (const contractor of contractors) {
      if (contractor.phone && contractor.phone.replace(/\D/g, '') === normalizedPhone) {
        await base44.asServiceRole.entities.Contractor.update(contractor.id, { phone: null });
        removedContractorCount++;
      }
    }

    return Response.json({
      success: true,
      message: `Removed phone number ${phoneNumber} from all profiles`,
      removedCustomerCount,
      removedContractorCount,
      totalRemoved: removedCustomerCount + removedContractorCount
    });
  } catch (error) {
    console.error('Phone removal error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});