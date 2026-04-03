import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Webhook handler for incoming SMS from Twilio
Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);

    // Parse incoming Twilio SMS webhook
    const formData = await req.formData();
    const from = formData.get('From'); // Sender's phone number
    const body = formData.get('Body'); // Message content
    const messageSid = formData.get('MessageSid'); // Twilio message ID
    const to = formData.get('To'); // Our Twilio number

    if (!from || !body) {
      return Response.json({ error: 'Missing From or Body' }, { status: 400 });
    }

    // TODO: Find or create conversation based on phone number
    // For now, log the incoming message
    console.log(`Incoming SMS from ${from}: ${body}`);

    // Placeholder response
    return Response.json({
      success: true,
      message: 'SMS received',
      note: 'Full Twilio integration pending',
    });
  } catch (error) {
    console.error('SMS Receive Error:', error);
    return Response.json(
      { error: `Failed to receive SMS: ${error.message}` },
      { status: 500 }
    );
  }
});