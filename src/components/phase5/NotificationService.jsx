import { base44 } from '@/api/base44Client';

export const NotificationTypes = {
  MILESTONE_COMPLETED: 'milestone_completed',
  FILE_UPLOADED: 'file_uploaded',
  MESSAGE_RECEIVED: 'message_received',
  SCOPE_APPROVED: 'scope_approved',
  SCOPE_REJECTED: 'scope_rejected',
  BUDGET_ALERT: 'budget_alert',
  TEAM_MEMBER_ADDED: 'team_member_added',
};

export const NotificationConfig = {
  [NotificationTypes.MILESTONE_COMPLETED]: {
    title: 'Milestone Completed',
    icon: '✓',
    color: 'green',
    priority: 'high',
  },
  [NotificationTypes.FILE_UPLOADED]: {
    title: 'File Uploaded',
    icon: '📄',
    color: 'blue',
    priority: 'medium',
  },
  [NotificationTypes.MESSAGE_RECEIVED]: {
    title: 'New Message',
    icon: '💬',
    color: 'blue',
    priority: 'medium',
  },
  [NotificationTypes.SCOPE_APPROVED]: {
    title: 'Scope Approved',
    icon: '✓',
    color: 'green',
    priority: 'high',
  },
  [NotificationTypes.SCOPE_REJECTED]: {
    title: 'Scope Rejected',
    icon: '✗',
    color: 'red',
    priority: 'high',
  },
  [NotificationTypes.BUDGET_ALERT]: {
    title: 'Budget Alert',
    icon: '⚠️',
    color: 'yellow',
    priority: 'high',
  },
  [NotificationTypes.TEAM_MEMBER_ADDED]: {
    title: 'Team Member Added',
    icon: '👤',
    color: 'blue',
    priority: 'medium',
  },
};

// Subscribe to real-time project notifications
export const subscribeToProjectNotifications = (scopeId, callback) => {
  const unsubscribe = base44.entities.ProjectMessage.subscribe((event) => {
    if (event.data.scope_id === scopeId) {
      callback({
        type: NotificationTypes.MESSAGE_RECEIVED,
        data: event.data,
        timestamp: new Date(),
      });
    }
  });
  return unsubscribe;
};

// Subscribe to milestone updates
export const subscribeToMilestoneUpdates = (scopeId, callback) => {
  const unsubscribe = base44.entities.ProjectMilestone.subscribe((event) => {
    if (event.data.scope_id === scopeId && event.data.status === 'completed') {
      callback({
        type: NotificationTypes.MILESTONE_COMPLETED,
        data: event.data,
        timestamp: new Date(),
      });
    }
  });
  return unsubscribe;
};

// Subscribe to file uploads
export const subscribeToFileUploads = (scopeId, callback) => {
  const unsubscribe = base44.entities.ProjectFile.subscribe((event) => {
    if (event.data.scope_id === scopeId && event.type === 'create') {
      callback({
        type: NotificationTypes.FILE_UPLOADED,
        data: event.data,
        timestamp: new Date(),
      });
    }
  });
  return unsubscribe;
};