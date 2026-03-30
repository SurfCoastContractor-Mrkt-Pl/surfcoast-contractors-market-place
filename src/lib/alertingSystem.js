// Alerting & Notification System
// Multi-channel alert management with escalation and deduplication

import { base44 } from '@/api/base44Client';

export const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical',
  EMERGENCY: 'emergency'
};

export const ALERT_CHANNELS = {
  EMAIL: 'email',
  SMS: 'sms',
  WEBHOOK: 'webhook',
  IN_APP: 'in_app',
  SLACK: 'slack'
};

export const ALERT_STATUS = {
  TRIGGERED: 'triggered',
  ESCALATED: 'escalated',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved'
};

class AlertingSystem {
  constructor() {
    this.alerts = [];
    this.rules = new Map();
    this.channels = new Map();
    this.suppressions = new Map();
    this.setupDefaultChannels();
  }

  setupDefaultChannels() {
    // Email channel
    this.registerChannel(ALERT_CHANNELS.EMAIL, async (alert) => {
      try {
        await base44.integrations.Core.SendEmail({
          to: alert.recipient,
          subject: `[${alert.severity.toUpperCase()}] ${alert.title}`,
          body: alert.message
        });
        return true;
      } catch (err) {
        console.error('Email notification failed:', err);
        return false;
      }
    });

    // In-app channel
    this.registerChannel(ALERT_CHANNELS.IN_APP, async (alert) => {
      // Store in database
      try {
        await base44.asServiceRole.entities.Alert.create({
          title: alert.title,
          message: alert.message,
          severity: alert.severity,
          status: ALERT_STATUS.TRIGGERED,
          source: alert.source,
          recipient: alert.recipient
        });
        return true;
      } catch (err) {
        console.error('In-app notification failed:', err);
        return false;
      }
    });
  }

  registerChannel(name, handler) {
    this.channels.set(name, handler);
  }

  registerRule(name, condition, actions = {}) {
    this.rules.set(name, {
      name,
      condition,
      actions: {
        channels: actions.channels || [ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.IN_APP],
        escalate: actions.escalate || true,
        escalateAfter: actions.escalateAfter || 5 * 60 * 1000, // 5 minutes
        ...actions
      }
    });
  }

  // Check if alert should be suppressed
  isSuppressed(alertKey) {
    const suppression = this.suppressions.get(alertKey);
    if (!suppression) return false;

    if (suppression.until && new Date() < new Date(suppression.until)) {
      return true;
    }

    this.suppressions.delete(alertKey);
    return false;
  }

  // Suppress an alert
  suppressAlert(alertKey, duration = 3600000) {
    const until = new Date(Date.now() + duration);
    this.suppressions.set(alertKey, { until });
  }

  // Create and trigger an alert
  async triggerAlert(config) {
    const alertKey = `${config.source}_${config.metric}`;

    // Check if suppressed
    if (this.isSuppressed(alertKey)) {
      return null;
    }

    // Check rules
    let matchedRule = null;
    for (const [, rule] of this.rules) {
      if (rule.condition(config)) {
        matchedRule = rule;
        break;
      }
    }

    if (!matchedRule) {
      return null;
    }

    const alert = {
      id: `alert_${Date.now()}`,
      title: config.title,
      message: config.message,
      severity: config.severity || ALERT_SEVERITY.WARNING,
      source: config.source,
      metric: config.metric,
      value: config.value,
      recipient: config.recipient,
      channels: matchedRule.actions.channels,
      status: ALERT_STATUS.TRIGGERED,
      triggeredAt: new Date().toISOString(),
      rule: matchedRule.name,
      escalated: false,
      escalateAfter: matchedRule.actions.escalateAfter
    };

    this.alerts.push(alert);

    // Send notifications
    for (const channel of alert.channels) {
      const handler = this.channels.get(channel);
      if (handler) {
        try {
          await handler(alert);
        } catch (err) {
          console.error(`Failed to send ${channel} notification:`, err);
        }
      }
    }

    return alert;
  }

  // Acknowledge alert
  acknowledgeAlert(alertId) {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = ALERT_STATUS.ACKNOWLEDGED;
      alert.acknowledgedAt = new Date().toISOString();
    }
    return alert;
  }

  // Resolve alert
  resolveAlert(alertId, notes = '') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.status = ALERT_STATUS.RESOLVED;
      alert.resolvedAt = new Date().toISOString();
      alert.resolutionNotes = notes;
    }
    return alert;
  }

  // Get active alerts
  getActiveAlerts() {
    return this.alerts.filter(a => 
      a.status === ALERT_STATUS.TRIGGERED || 
      a.status === ALERT_STATUS.ESCALATED
    );
  }

  // Get alerts by severity
  getAlertsBySeverity(severity) {
    return this.alerts.filter(a => a.severity === severity);
  }

  // Get alert stats
  getStats() {
    const stats = {
      total: this.alerts.length,
      active: 0,
      acknowledged: 0,
      resolved: 0,
      bySeverity: {}
    };

    for (const alert of this.alerts) {
      if (alert.status === ALERT_STATUS.TRIGGERED || alert.status === ALERT_STATUS.ESCALATED) {
        stats.active++;
      } else if (alert.status === ALERT_STATUS.ACKNOWLEDGED) {
        stats.acknowledged++;
      } else if (alert.status === ALERT_STATUS.RESOLVED) {
        stats.resolved++;
      }

      if (!stats.bySeverity[alert.severity]) {
        stats.bySeverity[alert.severity] = 0;
      }
      stats.bySeverity[alert.severity]++;
    }

    return stats;
  }

  // Cleanup old alerts
  cleanup(maxAge = 7 * 24 * 60 * 60 * 1000) {
    const cutoff = new Date(Date.now() - maxAge);
    this.alerts = this.alerts.filter(a => 
      new Date(a.triggeredAt) >= cutoff
    );
  }
}

export const alertingSystem = new AlertingSystem();

// Setup default alert rules
export function setupDefaultAlertRules() {
  // Performance degradation alert
  alertingSystem.registerRule('performance_degradation', 
    (config) => config.metric === 'api_latency' && config.value > 2000,
    {
      channels: [ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.IN_APP],
      escalateAfter: 10 * 60 * 1000 // 10 minutes
    }
  );

  // High error rate alert
  alertingSystem.registerRule('high_error_rate',
    (config) => config.metric === 'error_rate' && config.value > 5,
    {
      channels: [ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.IN_APP],
      escalateAfter: 5 * 60 * 1000 // 5 minutes
    }
  );

  // Critical service failure
  alertingSystem.registerRule('critical_failure',
    (config) => config.severity === ALERT_SEVERITY.CRITICAL,
    {
      channels: [ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.IN_APP],
      escalateAfter: 2 * 60 * 1000 // 2 minutes
    }
  );

  // Health check failure
  alertingSystem.registerRule('health_check_failure',
    (config) => config.metric === 'health_status' && config.value > 0,
    {
      channels: [ALERT_CHANNELS.EMAIL, ALERT_CHANNELS.IN_APP],
      escalateAfter: 5 * 60 * 1000
    }
  );
}

// Start alert management
export function startAlertingSchedule(intervalMs = 60000) {
  setInterval(() => {
    // Check for escalations
    const activeAlerts = alertingSystem.getActiveAlerts();
    for (const alert of activeAlerts) {
      const age = Date.now() - new Date(alert.triggeredAt).getTime();
      if (!alert.escalated && age > alert.escalateAfter) {
        alert.status = ALERT_STATUS.ESCALATED;
        alert.escalatedAt = new Date().toISOString();
        console.log(`Alert escalated: ${alert.title}`);
      }
    }

    // Cleanup old alerts
    alertingSystem.cleanup();
  }, intervalMs);
}