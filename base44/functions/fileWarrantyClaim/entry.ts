import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { warrantyId, issueDescription, photoUrls } = await req.json();
    if (!warrantyId || !issueDescription) {
      return Response.json({ error: 'Warranty ID and issue description required' }, { status: 400 });
    }

    // Get warranty
    const warranties = await base44.entities.Warranty.filter({ id: warrantyId });
    if (!warranties?.[0]) {
      return Response.json({ error: 'Warranty not found' }, { status: 404 });
    }

    const warranty = warranties[0];
    const claimId = `claim_${Date.now()}`;

    // Add claim
    warranty.claims = warranty.claims || [];
    warranty.claims.push({
      claim_id: claimId,
      issue_description: issueDescription,
      reported_date: new Date().toISOString(),
      status: 'open',
      photo_urls: photoUrls || [],
    });

    await base44.entities.Warranty.update(warrantyId, warranty);

    // Notify contractor
    const contractor = await base44.entities.Contractor.filter({
      id: warranty.contractor_id,
    });

    if (contractor?.[0]) {
      await base44.integrations.Core.SendEmail({
        to: warranty.contractor_email,
        subject: 'New Warranty Claim',
        body: `A warranty claim has been filed for your completed job.\n\nIssue: ${issueDescription}\n\nPlease review and respond within 5 business days.`,
      });
    }

    return Response.json({ success: true, claimId, warranty });
  } catch (error) {
    console.error('File warranty claim error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});