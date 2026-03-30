import { base44 } from '@/api/base44Client';

/**
 * Track user actions for analytics
 */
export const trackEvent = (eventName, properties = {}) => {
  try {
    base44.analytics.track({
      eventName,
      properties
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Common events
export const EVENTS = {
  LOCATION_RATED: 'location_rated',
  LOCATION_SELECTED: 'location_selected',
  MESSAGE_SENT: 'message_sent',
  RATING_VIEWED: 'rating_viewed',
  VENDOR_CLICKED: 'vendor_clicked',
  SEARCH_PERFORMED: 'search_performed',
  SIGNUP_STARTED: 'signup_started',
  SIGNUP_COMPLETED: 'signup_completed',
};