import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

// SECURITY: Database-backed idempotency for webhook processing
// Uses ProcessedWebhookEvent entity instead of in-memory storage

export async function isWebhookProcessed(base44, eventId) {
  try {
    const events = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({
      stripe_event_id: eventId
    });
    return events && events.length > 0;
  } catch (error) {
    console.error('Error checking webhook idempotency:', error.message);
    return false; // Assume not processed on error, let it retry
  }
}

export async function markWebhookProcessed(base44, eventId, eventType, eventData) {
  try {
    await base44.asServiceRole.entities.ProcessedWebhookEvent.create({
      stripe_event_id: eventId,
      event_type: eventType,
      event_data: JSON.stringify(eventData),
      processed_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error marking webhook as processed:', error.message);
  }
}

export async function getProcessedEventStats(base44) {
  try {
    const events = await base44.asServiceRole.entities.ProcessedWebhookEvent.filter({});
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recent = events?.filter(e => e.created_date >= oneDayAgo) || [];
    return {
      totalEvents: events?.length || 0,
      recentEvents: recent.length
    };
  } catch (error) {
    console.error('Error getting webhook stats:', error.message);
    return { totalEvents: 0, recentEvents: 0 };
  }
}