// Activity & Audit Logging
// Comprehensive tracking of user actions and system changes for compliance and debugging

import { base44 } from '@/api/base44Client';

export const ACTION_TYPES = {
  CREATE: 'create',
  READ: 'read',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  EXPORT: 'export',
  IMPORT: 'import',
  PAYMENT: 'payment',
  APPROVE: 'approve',
  REJECT: 'reject',
  DOWNLOAD: 'download',
  UPLOAD: 'upload',
  SHARE: 'share',
  ACCESS: 'access'
};

export const ENTITY_TYPES = {
  USER: 'user',
  CONTRACTOR: 'contractor',
  CUSTOMER: 'customer',
  JOB: 'job',
  SCOPE: 'scope',
  PAYMENT: 'payment',
  MESSAGE: 'message',
  REVIEW: 'review',
  DOCUMENT: 'document',
  PROPOSAL: 'proposal',
  QUOTE: 'quote',
  DISPUTE: 'dispute',
  SYSTEM: 'system'
};

export const SEVERITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

class AuditLogger {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.setupListeners();
  }

  setupListeners() {
    window.addEventListener('online', () => { this.isOnline = true; this.flushQueue(); });
    window.addEventListener('offline', () => { this.isOnline = false; });
  }

  async log({
    actionType = ACTION_TYPES.READ,
    entityType = ENTITY_TYPES.SYSTEM,
    entityId = null,
    entityName = null,
    userId = null,
    userEmail = null,
    description = '',
    severity = SEVERITY_LEVELS.LOW,
    changes = null,
    metadata = {}
  }) {
    try {
      const auditEntry = {
        action_type: actionType,
        entity_type: entityType,
        entity_id: entityId,
        entity_name: entityName,
        user_id: userId,
        user_email: userEmail,
        description,
        severity,
        changes: changes ? JSON.stringify(changes) : null,
        metadata: JSON.stringify(metadata),
        ip_address: await this.getClientIp(),
        user_agent: navigator.userAgent,
        timestamp: new Date().toISOString()
      };

      if (this.isOnline) {
        try {
          await base44.functions.invoke('logActivity', auditEntry);
        } catch (err) {
          console.error('Failed to log activity:', err);
          this.queue.push(auditEntry);
        }
      } else {
        this.queue.push(auditEntry);
        this.saveQueueToLocalStorage();
      }
    } catch (err) {
      console.error('Error in auditLogger.log:', err);
    }
  }

  async getClientIp() {
    // This would be set by backend, but we'll use what's available
    return 'client';
  }

  async flushQueue() {
    if (this.queue.length === 0) return;

    const itemsToSend = [...this.queue];
    this.queue = [];

    for (const item of itemsToSend) {
      try {
        await base44.functions.invoke('logActivity', item);
      } catch (err) {
        this.queue.push(item);
      }
    }

    if (this.queue.length === 0) {
      localStorage.removeItem('auditLogQueue');
    } else {
      this.saveQueueToLocalStorage();
    }
  }

  saveQueueToLocalStorage() {
    try {
      localStorage.setItem('auditLogQueue', JSON.stringify(this.queue));
    } catch {}
  }

  loadQueueFromLocalStorage() {
    try {
      const saved = localStorage.getItem('auditLogQueue');
      if (saved) {
        this.queue = JSON.parse(saved);
        this.flushQueue();
      }
    } catch {}
  }
}

export const auditLogger = new AuditLogger();

// Initialize on app load
if (typeof window !== 'undefined') {
  auditLogger.loadQueueFromLocalStorage();
}

// Helper functions for common audit scenarios
export async function logUserAction(action, entity, userId, metadata = {}) {
  await auditLogger.log({
    actionType: action,
    entityType: entity.type,
    entityId: entity.id,
    entityName: entity.name,
    userId,
    severity: SEVERITY_LEVELS.MEDIUM,
    metadata
  });
}

export async function logDataChange(entity, changes, userId, before, after) {
  await auditLogger.log({
    actionType: ACTION_TYPES.UPDATE,
    entityType: entity.type,
    entityId: entity.id,
    entityName: entity.name,
    userId,
    description: `Updated ${entity.type}: ${Object.keys(changes).join(', ')}`,
    severity: SEVERITY_LEVELS.MEDIUM,
    changes: { before, after, fields: Object.keys(changes) },
    metadata: { fieldCount: Object.keys(changes).length }
  });
}

export async function logSecurityEvent(description, userId, severity = SEVERITY_LEVELS.HIGH, metadata = {}) {
  await auditLogger.log({
    actionType: ACTION_TYPES.ACCESS,
    entityType: ENTITY_TYPES.SYSTEM,
    description,
    userId,
    severity,
    metadata: { type: 'security_event', ...metadata }
  });
}