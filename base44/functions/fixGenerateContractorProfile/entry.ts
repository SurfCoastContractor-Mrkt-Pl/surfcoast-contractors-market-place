import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractor_email, contractor_name, years_experience = 5, trade = 'General Contracting', location = 'Your Area' } = await req.json();

    if (!contractor_email || !contractor_name) {
      return Response.json({ error: 'contractor_email and contractor_name required' }, { status: 400 });
    }

    const bio = `With ${years_experience}+ years of experience in ${trade}, I specialize in delivering high-quality craftsmanship and reliable service tailored to meet the unique needs of each client. My commitment to excellence and attention to detail has earned me a reputation for transforming spaces on time and within budget. I am based in ${location} and am ready to bring your vision to life with competitive pricing that reflects the quality of my work.`;

    const headline = `${trade} Specialist | ${years_experience}+ Years Experience`;
    const tagline = `Trusted ${trade} Professional in ${location}`;

    return Response.json({
      success: true,
      contractor_email,
      contractor_name,
      bio,
      suggestions: {
        headline,
        tagline,
        call_to_action: 'Get Your Free Quote Today'
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});