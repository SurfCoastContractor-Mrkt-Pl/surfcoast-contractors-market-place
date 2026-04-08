import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { message_text, sender_email, recipient_email } = await req.json();

    // Simple language detection (in production, use a proper library)
    const detectLanguage = (text) => {
      const spanishWords = /\b(el|la|de|que|y|a|en|se|no|los|las|por|para|con|una|como|es|del|uno)\b/i;
      const frenchWords = /\b(le|la|de|que|et|a|en|se|non|les|par|pour|avec|une|comme|est|du|un)\b/i;
      const germanWords = /\b(der|die|das|und|in|ist|ein|eine|von|zu|den|mit|sich|des)\b/i;

      if (spanishWords.test(text) && text.match(/[áéíóúñ]/)) return 'es';
      if (frenchWords.test(text) && text.match(/[àèéêëîôûœç]/)) return 'fr';
      if (germanWords.test(text) && text.match(/[äöüß]/)) return 'de';
      return 'en';
    };

    const detected = detectLanguage(message_text);

    if (detected !== 'en') {
      // Get recipient's language preference
      const recipientPrefs = await base44.entities.UserLanguagePreference.filter({
        user_email: recipient_email
      });
      const recipientLang = recipientPrefs?.[0]?.preferred_language || 'en';

      if (detected !== recipientLang) {
        return Response.json({
          language_mismatch: true,
          sender_language: detected,
          recipient_language: recipientLang,
          notification: `Message detected in ${detected}. Recipient speaks ${recipientLang}. AI translation will be applied.`
        });
      }
    }

    return Response.json({ language_mismatch: false });
  } catch (error) {
    console.error('Error detecting language:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});