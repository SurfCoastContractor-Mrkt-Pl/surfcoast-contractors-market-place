import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { job_title, property_type, brief_description, budget, timeline } = await req.json();

    const prompt = `Generate a detailed, professional job description for a contractor job posting with the following details:
- Job Title: ${job_title}
- Property Type: ${property_type || 'Not specified'}
- Brief Description: ${brief_description || 'Not specified'}
- Budget: ${budget || 'Negotiable'}
- Timeline: ${timeline || 'Flexible'}

Write a comprehensive job description that:
1. Clearly explains what work needs to be done
2. Specifies any specific requirements or constraints
3. Mentions the budget range and timeline
4. Is encouraging but professional
5. Is 3-4 sentences and suitable for a job posting

Return ONLY the job description text, no introduction or explanation.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gpt_5_mini',
    });

    return Response.json({ description: response });
  } catch (error) {
    console.error('Job description generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});