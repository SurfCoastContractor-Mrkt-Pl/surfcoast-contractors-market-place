import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const EXCLUDED_EMAILS = [
  'hexthegreat25@gmail.com',
  'hanavarrete83@gmail.com',
  'surfcoastplumbing.sd@gmail.com',
  'danielleyg@aol.com'
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Must be authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { eventName, properties = {}, userEmail } = body;

    // Validate required fields
    if (!eventName) {
      return Response.json({ tracked: false, reason: 'missing_event_name' });
    }

    // Check if user email is in exclusion list
    if (userEmail && EXCLUDED_EMAILS.includes(userEmail.toLowerCase())) {
      console.log(`[Analytics] Filtered event from excluded email: ${userEmail}`);
      return Response.json({ tracked: false, reason: 'excluded_user' });
    }

    // Track the event normally
    await base44.analytics.track({
      eventName,
      properties
    });

    return Response.json({ tracked: true });
  } catch (error) {
    console.error('[Analytics Error]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});