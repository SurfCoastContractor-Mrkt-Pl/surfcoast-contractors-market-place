import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

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

      // Call content moderation via SDK
      const modResult = await base44.asServiceRole.functions.invoke('validateContentModeration', {
        content: line_of_work_other,
        field_name: 'line_of_work_other'
      });

      if (!modResult?.valid) {
        return Response.json({ 
          error: modResult?.error || 'Content did not pass moderation checks',
          valid: false
        }, { status: 400 });
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