import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// Prohibited keywords and patterns
const PROHIBITED_PATTERNS = [
  /(?:porn|xxx|nude|sex|adult|erotic|nsfw|sexual)/gi,
  /(?:escort|prostitute|massage.*happy|sugar.*daddy|sugar.*baby)/gi,
  /(?:drugs?|cocaine|meth|heroin|marijuana|cannabis|fentanyl)/gi,
  /(?:weapon|gun|bomb|explosive)/gi,
  /(?:hate|racist|bigot|slur|derogatory)/gi,
  /(?:scam|fraud|scheme)/gi,
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Verify authorization
    const internalKey = req.headers.get('x-internal-service-key');
    if (internalKey !== Deno.env.get('INTERNAL_SERVICE_KEY')) {
      const user = await base44.auth.me();
      if (!user) {
        return Response.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const { content, field_name } = await req.json();

    if (!content || typeof content !== 'string') {
      return Response.json({ 
        valid: true, 
        message: 'Content is empty or invalid' 
      });
    }

    const trimmedContent = content.trim();

    // Check for prohibited patterns
    for (const pattern of PROHIBITED_PATTERNS) {
      if (pattern.test(trimmedContent)) {
        return Response.json({ 
          valid: false, 
          error: 'Content contains prohibited language or references',
          message: 'Please ensure your content is appropriate and does not contain explicit, offensive, or illegal references.'
        }, { status: 400 });
      }
    }

    // Check for extremely short or invalid content
    if (trimmedContent.length < 3) {
      return Response.json({ 
        valid: false,
        error: 'Content is too short'
      }, { status: 400 });
    }

    // Check for spam-like patterns (excessive repetition)
    const words = trimmedContent.toLowerCase().split(/\s+/);
    const wordFreq = {};
    for (const word of words) {
      wordFreq[word] = (wordFreq[word] || 0) + 1;
    }
    const maxFreq = Math.max(...Object.values(wordFreq));
    if (maxFreq > trimmedContent.length * 0.5) {
      return Response.json({ 
        valid: false,
        error: 'Content appears to be spam'
      }, { status: 400 });
    }

    return Response.json({ 
      valid: true, 
      message: 'Content passed moderation checks',
      sanitized_content: trimmedContent
    });

  } catch (error) {
    console.error('Content moderation error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});