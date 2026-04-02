import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, lineOfWork, yearsExperience, skills, location, rateType, rate } = await req.json();

    // Generate bio using LLM
    const bioResponse = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate a professional, compelling 2-3 sentence bio for a contractor:
- Name: ${name}
- Line of Work: ${lineOfWork}
- Years of Experience: ${yearsExperience}
- Skills: ${skills?.join(', ')}
- Location: ${location}
- Rate Type: ${rateType} ($${rate})

Make it engaging, professional, and suitable for a marketplace profile.`,
      response_json_schema: {
        type: 'object',
        properties: {
          bio: { type: 'string' },
        },
      },
    });

    const bio = bioResponse.bio || '';

    return Response.json({
      success: true,
      bio,
      suggestions: {
        headline: `${lineOfWork} Specialist | ${yearsExperience}+ Years`,
        tagline: `Trusted ${lineOfWork} Professional in ${location}`,
      },
    });
  } catch (error) {
    console.error('Profile generation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});