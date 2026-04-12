/**
 * Send SMS Notification via Twilio
 * Time-sensitive alerts to contractors/clients
 * Requires TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER secrets
 */
/* eslint-disable no-undef */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'POST required' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const { phone, message, type } = await req.json();

    // Get Twilio credentials from secrets (user must set these)
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhone) {
      console.warn('Twilio SMS not configured - skipping');
      return Response.json({ 
        success: true,
        skipped: true,
        message: 'SMS skipped - Twilio not configured'
      });
    }

    // Send via Twilio API
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const auth = btoa(`${accountSid}:${authToken}`);

    const body = new URLSearchParams({
      From: twilioPhone,
      To: phone,
      Body: message
    });

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: body.toString()
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(`Twilio error: ${result.message}`);
    }

    console.log(`SMS sent to ${phone}, SID: ${result.sid}`);

    // Log SMS in database
    if (type) {
      await base44.entities.SMSMessage.create({
        sender_phone: twilioPhone,
        recipient_phone: phone,
        body: message,
        direction: 'outbound',
        status: 'sent',
        twilio_sid: result.sid
      });
    }

    return Response.json({ 
      success: true,
      message_sid: result.sid,
      sent_to: phone
    });
  } catch (error) {
    console.error('sendSMSNotification error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});