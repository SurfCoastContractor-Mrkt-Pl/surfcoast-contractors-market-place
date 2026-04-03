import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { conversation_id, recipient_phone, message_body, sender_type } = await req.json();

    if (!conversation_id || !recipient_phone || !message_body) {
      return Response.json(
        { error: 'Missing required fields: conversation_id, recipient_phone, message_body' },
        { status: 400 }
      );
    }

    // Fetch conversation to verify access and get details
    const conversation = await base44.entities.SMSConversation.filter({
      id: conversation_id,
    });

    if (!conversation || conversation.length === 0) {
      return Response.json({ error: 'Conversation not found' }, { status: 404 });
    }

    const conv = conversation[0];

    // Verify user has access to this conversation
    const hasAccess =
      conv.contractor_email === user.email ||
      conv.client_email === user.email;

    if (!hasAccess) {
      return Response.json({ error: 'Forbidden: No access to this conversation' }, { status: 403 });
    }

    // TODO: Integrate Twilio when credentials are available
    // For now, create the message record with "pending" status
    const messageRecord = await base44.entities.SMSMessage.create({
      conversation_id,
      sender_email: user.email,
      sender_phone: sender_type === 'contractor' ? conv.contractor_phone : conv.client_phone,
      sender_type,
      recipient_phone,
      body: message_body,
      status: 'queued',
      direction: 'outbound',
    });

    // Update conversation's last message
    await base44.entities.SMSConversation.update(conversation_id, {
      last_message: message_body.substring(0, 100),
      last_message_time: new Date().toISOString(),
    });

    return Response.json({
      success: true,
      message_id: messageRecord.id,
      status: 'queued',
      note: 'Twilio integration pending - message queued locally',
    });
  } catch (error) {
    console.error('SMS Send Error:', error);
    return Response.json(
      { error: `Failed to send SMS: ${error.message}` },
      { status: 500 }
    );
  }
});