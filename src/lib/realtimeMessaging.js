/**
 * Real-Time Messaging via Server-Sent Events (SSE)
 * Replaces 30-second polling with instant message delivery
 */

class RealTimeMessenger {
  constructor(userEmail) {
    this.userEmail = userEmail;
    this.eventSource = null;
    this.listeners = new Map();
  }

  /**
   * Connect to server-sent events stream
   */
  connect() {
    if (this.eventSource) return; // Already connected

    // Create SSE connection
    this.eventSource = new EventSource(
      `/api/messages/stream?email=${encodeURIComponent(this.userEmail)}`
    );

    // Handle new messages
    this.eventSource.addEventListener('message', (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit('newMessage', message);
        console.log('New message received:', message.id);
      } catch (error) {
        console.error('Failed to parse message:', error);
      }
    });

    // Handle connection status changes
    this.eventSource.addEventListener('open', () => {
      console.log('Real-time messaging connected');
      this.emit('connected', true);
    });

    this.eventSource.addEventListener('error', () => {
      console.warn('Real-time messaging disconnected, falling back to polling');
      this.disconnect();
      this.emit('connected', false);
      // Fall back to polling after 5 seconds
      setTimeout(() => this.connect(), 5000);
    });
  }

  /**
   * Disconnect from server-sent events
   */
  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  /**
   * Register event listener
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
  }

  /**
   * Unregister event listener
   */
  off(event, callback) {
    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit event to all listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in listener for ${event}:`, error);
        }
      });
    }
  }
}

export default RealTimeMessenger;