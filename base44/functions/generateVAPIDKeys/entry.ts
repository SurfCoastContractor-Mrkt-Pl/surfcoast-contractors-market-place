import webpush from 'npm:web-push@3.6.7';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }
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