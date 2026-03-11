import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { line_of_work, line_of_work_other } = await req.json();

    // Validate line_of_work is selected
    if (!line_of_work) {
      return Response.json({ 
        error: 'Line of work is required',
        valid: false
      }, { status: 400 });
    }

    // If 'other' is selected, validate custom input
    if (line_of_work === 'other') {
      if (!line_of_work_other || typeof line_of_work_other !== 'string') {
        return Response.json({ 
          error: 'Custom line of work must be provided when selecting Other',
          valid: false
        }, { status: 400 });
      }

      // Call content moderation
      try {
        const moderationResp = await fetch(`${req.headers.get('origin')}/api/validateContentModeration`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-internal-service-key': Deno.env.get('INTERNAL_SERVICE_KEY') || '',
          },
          body: JSON.stringify({
            content: line_of_work_other,
            field_name: 'line_of_work_other'
          }),
        });

        if (!moderationResp.ok) {
          const modError = await moderationResp.json();
          return Response.json({ 
            error: modError.message || 'Content did not pass moderation checks',
            valid: false
          }, { status: 400 });
        }

        const modResult = await moderationResp.json();
        if (!modResult.valid) {
          return Response.json({ 
            error: modResult.error,
            valid: false
          }, { status: 400 });
        }
      } catch (e) {
        console.error('Moderation check failed:', e.message);
        return Response.json({ 
          error: 'Unable to validate content at this time',
          valid: false
        }, { status: 503 });
      }
    }

    return Response.json({ 
      valid: true,
      message: 'Contractor registration data is valid'
    });

  } catch (error) {
    console.error('Contractor registration validation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});