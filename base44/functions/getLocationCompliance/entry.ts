import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's location from geolocation headers or request
    // For now, return null to let frontend handle location detection
    // In production, you'd integrate with IP geolocation service
    
    return Response.json({
      detected_state: null,
      compliance_info: {
        federal: 'FLSA, OSHA, EEOC, IRS 1099 rules apply',
        state: 'Verify all required licenses and permits in your state',
        platform: 'You are an independent contractor, not an employee',
        pricing: 'You set your own rates independently',
      }
    });
  } catch (error) {
    console.error('[getLocationCompliance] Error:', error);
    return Response.json(
      { error: error.message || 'Failed to fetch compliance info' },
      { status: 500 }
    );
  }
});