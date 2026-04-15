import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);

    // IP-based rate limiting — max 5 suggestions per hour per IP
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
                     req.headers.get('cf-connecting-ip') || 'unknown';
    const windowStart = new Date(Date.now() - 3600000).toISOString(); // 1 hour ago

    const recentByIp = await base44.asServiceRole.entities.ToolSuggestion.filter({
      submitter_ip: clientIp,
    });
    const recentCount = recentByIp.filter(s => s.created_date >= windowStart).length;
    if (recentCount >= 5) {
      return Response.json({ error: 'Too many suggestions submitted. Please try again later.' }, { status: 429 });
    }

    const { line_of_work, raw_suggestion, submitter_email, submitter_name } = await req.json();

    if (!line_of_work || !raw_suggestion) {
      return Response.json({ error: 'line_of_work and raw_suggestion are required' }, { status: 400 });
    }

    // Enforce reasonable input length limits
    if (raw_suggestion.length > 2000) {
      return Response.json({ error: 'Suggestion too long (max 2000 characters)' }, { status: 400 });
    }

    // Save the raw suggestion
    const suggestion = await base44.asServiceRole.entities.ToolSuggestion.create({
      line_of_work,
      raw_suggestion,
      submitter_email: submitter_email || '',
      submitter_name: submitter_name || '',
      submitter_ip: clientIp,
      ai_processed: false,
    });

    console.log(`[TOOL_SUGGESTION] Created suggestion ${suggestion.id} for line_of_work: ${line_of_work}`);

    return Response.json({ success: true, suggestion_id: suggestion.id });
  } catch (error) {
    console.error('[TOOL_SUGGESTION_ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});