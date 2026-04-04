/**
 * Messages Server-Sent Events (SSE) Stream
 * Pushes new messages to client in real-time instead of polling
 * Frontend: new RealTimeMessenger(userEmail).connect()
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

// Store active SSE connections
const connections = new Map();

Deno.serve(async (req) => {
  // SSE endpoint for real-time messages
  if (req.method === 'GET' && new URL(req.url).pathname === '/api/messages/stream') {
    try {
      const url = new URL(req.url);
      const userEmail = url.searchParams.get('email');

      if (!userEmail) {
        return new Response('Email required', { status: 400 });
      }

      // Check if already connected
      if (connections.has(userEmail)) {
        return new Response('Already connected', { status: 409 });
      }

      // Create SSE response
      const { readable, writable } = new TransformStream();
      const writer = writable.getWriter();

      // Store connection
      connections.set(userEmail, { writer, timestamp: Date.now() });

      // Send initial connection confirmation
      await writer.write(new TextEncoder().encode(':connected\n\n'));

      // Poll for new messages every 2 seconds
      const messageInterval = setInterval(async () => {
        try {
          const base44 = createClientFromRequest(req);
          
          // Fetch recent unread messages
          const messages = await base44.entities.Message.filter({
            recipient_email: userEmail,
            read: false
          });

          for (const message of messages) {
            const data = JSON.stringify(message);
            await writer.write(new TextEncoder().encode(`data: ${data}\n\n`));
          }
        } catch (error) {
          console.error('Error fetching messages:', error.message);
        }
      }, 2000);

      // Cleanup on disconnect
      readable.pipeTo(new WritableStream({
        close() {
          clearInterval(messageInterval);
          connections.delete(userEmail);
          console.log(`SSE disconnected: ${userEmail}`);
        },
        error() {
          clearInterval(messageInterval);
          connections.delete(userEmail);
        }
      })).catch(console.error);

      return new Response(readable, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    } catch (error) {
      console.error('SSE stream error:', error.message);
      return new Response(error.message, { status: 500 });
    }
  }

  // POST /api/messages/broadcast - Send message to all listeners of recipient
  if (req.method === 'POST' && new URL(req.url).pathname === '/api/messages/broadcast') {
    try {
      const { recipient_email, message_id } = await req.json();

      if (connections.has(recipient_email)) {
        const { writer } = connections.get(recipient_email);
        const data = JSON.stringify({ id: message_id });
        await writer.write(new TextEncoder().encode(`data: ${data}\n\n`));
        console.log(`Broadcast to ${recipient_email}: ${message_id}`);
      }

      return Response.json({ 
        success: true,
        broadcast_sent: !!connections.has(recipient_email)
      });
    } catch (error) {
      console.error('Broadcast error:', error.message);
      return Response.json({ error: error.message }, { status: 500 });
    }
  }

  return Response.json({ error: 'Not found' }, { status: 404 });
});