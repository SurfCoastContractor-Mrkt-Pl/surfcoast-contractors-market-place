// In-memory store for processed webhook event IDs (with 24-hour TTL)
// In production, this should use Redis or a database
const processedEvents = new Map();
const IDEMPOTENCY_TTL = 24 * 60 * 60 * 1000; // 24 hours

export function isWebhookProcessed(eventId) {
  if (processedEvents.has(eventId)) {
    const timestamp = processedEvents.get(eventId);
    if (Date.now() - timestamp < IDEMPOTENCY_TTL) {
      return true;
    } else {
      processedEvents.delete(eventId);
      return false;
    }
  }
  return false;
}

export function markWebhookProcessed(eventId) {
  processedEvents.set(eventId, Date.now());
  // Cleanup old entries
  for (const [id, timestamp] of processedEvents.entries()) {
    if (Date.now() - timestamp > IDEMPOTENCY_TTL) {
      processedEvents.delete(id);
    }
  }
}

export function getProcessedEventStats() {
  return {
    totalEvents: processedEvents.size,
    oldestEventAge: processedEvents.size > 0 
      ? Date.now() - Math.min(...Array.from(processedEvents.values()))
      : 0,
  };
}