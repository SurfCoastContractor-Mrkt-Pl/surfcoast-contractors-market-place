import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

// Public endpoint — returns only the count of approved early adopter waivers
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const waivers = await base44.asServiceRole.entities.EarlyAdopterWaiver.filter({ is_eligible: true });
    const count = waivers ? waivers.length : 0;
    return Response.json({ count });
  } catch (error) {
    console.error('getEarlyAdopterCount error:', error.message);
    return Response.json({ count: 0 });
  }
});