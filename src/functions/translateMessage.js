import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { message_text, sender_email, recipient_email, message_id } = await req.json();

    // Step 1: Detect language using AI
    const detectionResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect the language of the following text. Return the ISO 639-1 language code (e.g., en, es, fr, de, zh, ja, pt, it, ru, ar, ko, hi). If the text is English, return "en". Text: "${message_text}"`,
      response_json_schema: {
        type: 'object',
        properties: {
          language_code: { type: 'string' },
          language_name: { type: 'string' },
          confidence: { type: 'number' }
        }
      }
    });

    const detectedLang = detectionResult.language_code || 'en';
    
    // If English, no translation needed
    if (detectedLang === 'en') {
      return Response.json({ 
        translated: false, 
        original_language: 'en',
        message: 'Message is in English, no translation needed' 
      });
    }

    // Step 2: Get recipient's language preference
    const recipientPrefs = await base44.asServiceRole.entities.UserLanguagePreference.filter({
      user_email: recipient_email
    });
    const targetLang = recipientPrefs?.[0]?.preferred_language || 'en';

    // Step 3: Translate the message
    const translationResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Translate the following text from ${detectionResult.language_name} to ${targetLang === 'en' ? 'English' : targetLang}. Preserve the tone and meaning. Only return the translated text, nothing else. Text: "${message_text}"`,
      response_json_schema: {
        type: 'object',
        properties: {
          translated_text: { type: 'string' }
        }
      }
    });

    // Step 4: Store translation record
    await base44.asServiceRole.entities.MessageTranslation.create({
      message_id: message_id || 'direct',
      original_language: detectedLang,
      target_language: targetLang,
      original_text: message_text,
      translated_text: translationResult.translated_text,
      sender_email,
      recipient_email,
      confidence_score: detectionResult.confidence || 0.9
    });

    return Response.json({
      translated: true,
      original_language: detectedLang,
      original_language_name: detectionResult.language_name,
      target_language: targetLang,
      translated_text: translationResult.translated_text,
      confidence: detectionResult.confidence || 0.9
    });
  } catch (error) {
    console.error('Error translating message:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});