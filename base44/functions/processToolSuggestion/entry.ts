import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    // Allow only verified automation payloads, INTERNAL_SERVICE_KEY, or admin users
    const isValidAutomation = body?.event?.type && body?.event?.entity_name && body?.event?.entity_id;
    const serviceKey = req.headers.get('x-internal-key');
    const validServiceKey = serviceKey && serviceKey === Deno.env.get('INTERNAL_SERVICE_KEY');
    if (!isValidAutomation && !validServiceKey) {
      const user = await base44.auth.me().catch(() => null);
      if (!user || user.role !== 'admin') {
        return Response.json({ error: 'Forbidden: Admin or internal service access required' }, { status: 403 });
      }
    }

    // Support direct call with suggestion_id OR entity automation payload
    const suggestionId = body.suggestion_id || body?.event?.entity_id;

    if (!suggestionId) {
      return Response.json({ error: 'suggestion_id is required' }, { status: 400 });
    }

    // Fetch the suggestion
    const suggestion = await base44.asServiceRole.entities.ToolSuggestion.get(suggestionId);

    if (!suggestion) {
      return Response.json({ error: 'Suggestion not found' }, { status: 404 });
    }

    if (suggestion.ai_processed) {
      console.log(`[PROCESS_SUGGESTION] Already processed: ${suggestionId}`);
      return Response.json({ skipped: true, reason: 'Already processed' });
    }

    console.log(`[PROCESS_SUGGESTION] Processing suggestion ${suggestionId}`);

    // --- AI Extraction ---
    const aiResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are analyzing a tool/product/software suggestion submitted by an entrepreneur during signup on a professional marketplace platform. Your job is to extract structured information from their suggestion to help the platform team understand whether this is a legitimate professional tool request.

LINE OF WORK: ${suggestion.line_of_work}
SUGGESTION TEXT: ${suggestion.raw_suggestion}

Extract the following information. If something is unclear or not mentioned, make a reasonable inference based on the line of work and context. Respond ONLY in valid JSON.

{
  "tool_name": "The specific name of the tool, product, or item (normalize/clean it — e.g. 'ServiceTitan', 'QuickBooks Online', 'Jobber'). If no specific tool is named, infer a category name.",
  "ai_line_of_work": "Which field or profession this tool most naturally serves (may differ slightly from submitted line_of_work if broader)",
  "status_level": "Who in the field would use this — e.g. 'All Levels', 'Apprentice', 'Novice', 'Experienced', 'Expert', 'Master' — as a comma-separated list if multiple apply",
  "function": "One to two sentences on what this tool does and its core purpose",
  "impact": "How does this tool enhance or fundamentally change the way work is done in this field?",
  "adoption_likelihood": "How likely are others in this line of work to use this — 'Low', 'Medium', 'High', or 'Very High' — with a one-sentence reason",
  "alternatives": "Name up to 3 similar or competing tools, or say 'None commonly known'",
  "perceived_value": "Rate the value of this tool based on the description: 'Fair', 'Good', 'Great', or 'Amazing' — with a brief explanation",
  "legitimacy_score": "A number from 1 to 10 representing how likely this is a genuine professional tool request (10 = clearly a real, widely-used professional tool; 1 = sounds like a personal want or unrelated to the stated field)",
  "legitimacy_reasoning": "One to two sentences explaining your legitimacy score — what makes this seem like a real professional need or not"
}`,
      response_json_schema: {
        type: 'object',
        properties: {
          tool_name: { type: 'string' },
          ai_line_of_work: { type: 'string' },
          status_level: { type: 'string' },
          function: { type: 'string' },
          impact: { type: 'string' },
          adoption_likelihood: { type: 'string' },
          alternatives: { type: 'string' },
          perceived_value: { type: 'string' },
          legitimacy_score: { type: 'number' },
          legitimacy_reasoning: { type: 'string' },
        },
      },
    });

    // Mark suggestion as processed
    await base44.asServiceRole.entities.ToolSuggestion.update(suggestionId, {
      ai_processed: true,
      ai_tool_name: aiResult.tool_name,
      ai_line_of_work: aiResult.ai_line_of_work,
      ai_status_level: aiResult.status_level,
      ai_function: aiResult.function,
      ai_impact: aiResult.impact,
      ai_adoption_likelihood: aiResult.adoption_likelihood,
      ai_alternatives: aiResult.alternatives,
      ai_perceived_value: aiResult.perceived_value,
      ai_legitimacy_score: aiResult.legitimacy_score,
      ai_legitimacy_reasoning: aiResult.legitimacy_reasoning,
      ai_processed_at: new Date().toISOString(),
    });

    console.log(`[PROCESS_SUGGESTION] AI extracted tool: "${aiResult.tool_name}" for "${aiResult.ai_line_of_work}" (legitimacy: ${aiResult.legitimacy_score}/10)`);

    // --- Update Aggregate ---
    const toolKey = aiResult.tool_name?.toLowerCase().trim();
    const lineOfWorkKey = aiResult.ai_line_of_work?.toLowerCase().trim();

    const existingAggregates = await base44.asServiceRole.entities.ToolSuggestionAggregate.filter({
      tool_name: aiResult.tool_name,
      line_of_work: aiResult.ai_line_of_work,
    });

    const valueKey = (aiResult.perceived_value || '').split(' ')[0]; // e.g. "Great"

    if (existingAggregates && existingAggregates.length > 0) {
      const agg = existingAggregates[0];
      const newCount = (agg.mention_count || 0) + 1;

      // Merge status levels
      const existingLevels = agg.status_levels || [];
      const newLevels = aiResult.status_level ? aiResult.status_level.split(',').map(s => s.trim()) : [];
      const mergedLevels = [...new Set([...existingLevels, ...newLevels])];

      // Merge alternatives
      const existingAlts = agg.alternatives_mentioned || [];
      const newAlts = aiResult.alternatives && aiResult.alternatives !== 'None commonly known'
        ? aiResult.alternatives.split(',').map(s => s.trim())
        : [];
      const mergedAlts = [...new Set([...existingAlts, ...newAlts])];

      // Merge value distribution
      const valueDist = agg.perceived_value_distribution || {};
      valueDist[valueKey] = (valueDist[valueKey] || 0) + 1;

      // Update sample suggestions (keep max 5)
      const samples = agg.sample_raw_suggestions || [];
      if (samples.length < 5) {
        samples.push(suggestion.raw_suggestion.substring(0, 300));
      }

      // Recalculate avg legitimacy
      const currentAvg = agg.avg_legitimacy_score || aiResult.legitimacy_score;
      const newAvg = ((currentAvg * (newCount - 1)) + aiResult.legitimacy_score) / newCount;

      await base44.asServiceRole.entities.ToolSuggestionAggregate.update(agg.id, {
        mention_count: newCount,
        status_levels: mergedLevels,
        alternatives_mentioned: mergedAlts,
        perceived_value_distribution: valueDist,
        sample_raw_suggestions: samples,
        avg_legitimacy_score: Math.round(newAvg * 10) / 10,
        functions_summary: aiResult.function,
        impact_summary: aiResult.impact,
        adoption_likelihood: aiResult.adoption_likelihood,
        last_suggested_at: new Date().toISOString(),
      });

      console.log(`[PROCESS_SUGGESTION] Updated aggregate for "${aiResult.tool_name}" — now ${newCount} mentions`);

      // --- Check 100-mention threshold ---
      if (newCount >= 100 && !agg.admin_notified_at_100) {
        await base44.asServiceRole.entities.ToolSuggestionAggregate.update(agg.id, {
          admin_notified_at_100: true,
        });

        const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
        if (adminEmail) {
          const valueSummary = Object.entries(valueDist)
            .map(([k, v]) => `${k}: ${v} mention${v !== 1 ? 's' : ''}`)
            .join(', ');

          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `🔔 Platform Action Required: "${aiResult.tool_name}" has reached 100 suggestions`,
            body: `Hi Admin,

A tool has crossed the 100-suggestion threshold and warrants your review for potential platform integration.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOOL OVERVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Tool / Product Name:   ${aiResult.tool_name}
Field of Work:         ${aiResult.ai_line_of_work}
Total Mentions:        ${newCount}
Average Legitimacy:    ${Math.round(newAvg * 10) / 10} / 10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT IS IT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${aiResult.function}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHO WOULD USE IT?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Skill Levels Mentioned: ${mergedLevels.join(', ') || 'Not specified'}
Adoption Likelihood:    ${aiResult.adoption_likelihood}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HOW DOES IT CHANGE THE WAY PEOPLE WORK?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${agg.impact_summary || aiResult.impact}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PERCEIVED VALUE (across all ${newCount} suggestions)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${valueSummary || 'No value data yet'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ALTERNATIVE / COMPETING TOOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${mergedAlts.length > 0 ? mergedAlts.join(', ') : 'None mentioned by users'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
IS THIS A REAL PROFESSIONAL TOOL?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Legitimacy Score: ${Math.round(newAvg * 10) / 10} / 10
${aiResult.legitimacy_reasoning}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SAMPLE USER SUGGESTIONS (up to 5)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${samples.map((s, i) => `[${i + 1}] "${s}"`).join('\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTIONS TO CONSIDER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Can this tool be integrated into WAVE OS or the contractor dashboard?
2. Should this be offered as a platform partner or affiliate tool?
3. Is this something we could build natively, or link/recommend externally?
4. Does the legitimacy score (${Math.round(newAvg * 10) / 10}/10) suggest this is a real industry need?
5. Should we survey more users in the "${aiResult.ai_line_of_work}" field specifically?

This notification was sent automatically. Review the full suggestion database in the Admin dashboard for complete records.

— SurfCoast Platform Automation`,
          });

          console.log(`[PROCESS_SUGGESTION] Admin notified at 100 mentions for "${aiResult.tool_name}"`);
        }
      }
    } else {
      // Create new aggregate
      const valueDist = {};
      valueDist[valueKey] = 1;

      await base44.asServiceRole.entities.ToolSuggestionAggregate.create({
        tool_name: aiResult.tool_name,
        line_of_work: aiResult.ai_line_of_work,
        mention_count: 1,
        admin_notified_at_100: false,
        status_levels: aiResult.status_level ? aiResult.status_level.split(',').map(s => s.trim()) : [],
        functions_summary: aiResult.function,
        impact_summary: aiResult.impact,
        adoption_likelihood: aiResult.adoption_likelihood,
        alternatives_mentioned: aiResult.alternatives && aiResult.alternatives !== 'None commonly known'
          ? aiResult.alternatives.split(',').map(s => s.trim())
          : [],
        perceived_value_distribution: valueDist,
        avg_legitimacy_score: aiResult.legitimacy_score,
        sample_raw_suggestions: [suggestion.raw_suggestion.substring(0, 300)],
        last_suggested_at: new Date().toISOString(),
      });

      console.log(`[PROCESS_SUGGESTION] Created new aggregate for "${aiResult.tool_name}" in "${aiResult.ai_line_of_work}"`);
    }

    return Response.json({ success: true, tool_name: aiResult.tool_name, legitimacy_score: aiResult.legitimacy_score });
  } catch (error) {
    console.error('[PROCESS_SUGGESTION_ERROR]', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});