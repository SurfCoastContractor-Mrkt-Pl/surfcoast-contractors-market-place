import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { prompt, contentType } = await req.json();

    if (!prompt || !contentType) {
      return Response.json(
        { error: 'Missing required fields: prompt, contentType' },
        { status: 400 }
      );
    }

    // Build context-aware system prompt based on content type
    const systemPrompts = {
      bio: 'You are a professional copywriter. Write a compelling, concise professional bio (2-3 sentences) for a contractor. Be specific about skills and value proposition.',
      jobDescription: 'You are a professional copywriter. Write a clear, engaging job description (3-4 sentences) that attracts qualified contractors.',
      scopeSummary: 'You are a professional copywriter. Write a detailed scope of work summary (3-4 sentences) that clearly describes the work to be completed.',
      proposal: 'You are a professional copywriter. Write a concise business proposal opening (2-3 sentences) that hooks the reader.',
    };

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          generatedText: {
            type: 'string',
            description: 'The generated text content',
          },
        },
      },
      add_context_from_internet: false,
    });

    return Response.json({
      generatedText: response.generatedText || response,
      contentType,
    });
  } catch (error) {
    console.error('generateTextContent error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});