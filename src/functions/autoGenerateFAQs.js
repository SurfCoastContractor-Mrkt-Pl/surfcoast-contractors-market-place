import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    // Get all existing FAQs to avoid duplicates
    const existingFAQs = await base44.entities.FAQArticle.list();
    const existingQuestions = existingFAQs.map(f => f.question);

    // Define all line of work categories
    const categories = [
      'electrician', 'plumber', 'carpenter', 'hvac', 'mason', 'roofer', 'painter',
      'welder', 'tiler', 'landscaper', 'freelance_writer', 'freelance_designer',
      'freelance_developer', 'freelance_photographer', 'freelance_videographer',
      'artist_painter', 'artist_sculptor', 'musician', 'consultant', 'tutor_educator'
    ];

    const generatedFAQs = [];

    for (const category of categories) {
      // Call AI to generate 3-5 FAQs for this category
      const prompt = `Generate 5 unique, practical FAQ questions and answers for someone working in the ${category} field. Focus on common problems, tools, techniques, and professional advice. Return as JSON array with objects containing "question" and "answer" fields.`;

      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            faqs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  answer: { type: 'string' }
                }
              }
            }
          }
        }
      });

      if (aiResponse.faqs) {
        for (const faq of aiResponse.faqs) {
          if (!existingQuestions.includes(faq.question)) {
            generatedFAQs.push({
              question: faq.question,
              answer: faq.answer,
              category,
              is_published: true,
              ai_generated: true,
              last_ai_refresh: new Date().toISOString()
            });
          }
        }
      }
    }

    // Bulk create FAQs
    if (generatedFAQs.length > 0) {
      await base44.entities.FAQArticle.bulkCreate(generatedFAQs);
    }

    return Response.json({
      success: true,
      faqs_generated: generatedFAQs.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating FAQs:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});