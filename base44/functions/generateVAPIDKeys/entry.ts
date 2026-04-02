import webpush from 'npm:web-push@3.6.7';

Deno.serve(async (req) => {
  try {
    const vapidKeys = webpush.generateVAPIDKeys();
    return Response.json({
      success: true,
      publicKey: vapidKeys.publicKey,
      privateKey: vapidKeys.privateKey,
      message: 'VAPID keys generated successfully. Store these securely.'
    });
  } catch (error) {
    console.error('VAPID generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});