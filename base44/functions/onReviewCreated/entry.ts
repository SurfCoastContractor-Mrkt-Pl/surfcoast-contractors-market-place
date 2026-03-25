import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const payload = await req.json();
    const { event, data } = payload;

    if (event.type !== 'create' || !data.contractor_id) {
      return Response.json({ success: true });
    }

    // Aggregate ratings for the contractor
    await base44.asServiceRole.functions.invoke('aggregateContractorRatings', {
      contractor_id: data.contractor_id
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error in onReviewCreated:', error);
    return Response.json({ success: true });
  }
});