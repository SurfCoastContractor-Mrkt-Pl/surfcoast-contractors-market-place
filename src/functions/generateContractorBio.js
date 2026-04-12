import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
/* eslint-disable no-undef */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { trade_specialty, line_of_work, years_experience, skills, certifications } = await req.json();

    const prompt = `Generate a professional, compelling bio for a contractor with the following details:
- Specialty/Trade: ${trade_specialty || line_of_work || 'General contractor'}
- Years of Experience: ${years_experience || 'Not specified'}
- Skills: ${skills?.join(', ') || 'Not specified'}
- Certifications: ${certifications?.join(', ') || 'None listed'}

Write a 2-3 sentence bio that:
1. Highlights their expertise and experience
2. Conveys professionalism and reliability
3. Is warm but professional in tone
4. Is suitable for a profile page

Return ONLY the bio text, no introduction or explanation.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
    });

    return Response.json({ bio: response });
  } catch (error) {
    console.error('Bio generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});