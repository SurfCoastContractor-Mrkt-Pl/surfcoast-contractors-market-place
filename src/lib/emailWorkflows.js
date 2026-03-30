import { base44 } from '@/api/base44Client';

/**
 * Email workflow utilities
 * These call backend email functions
 */

export const emailWorkflows = {
  // Send review request after job completion
  sendReviewRequest: async (rating) => {
    return await base44.functions.invoke('createReviewEmailRequest', {
      scope_id: rating.scope_id,
      reviewer_email: rating.reviewer_email,
      reviewer_name: rating.reviewer_name,
    });
  },

  // Send verification email
  sendVerificationEmail: async (email) => {
    return await base44.functions.invoke('sendEmailVerification', {
      email,
    });
  },

  // Send compliance notification
  sendComplianceNotification: async (email, reason) => {
    return await base44.functions.invoke('sendComplianceNotification', {
      email,
      reason,
    });
  },

  // Send generic email (requires admin)
  sendAdminEmail: async (to, subject, body) => {
    return await base44.integrations.Core.SendEmail({
      to,
      subject,
      body,
      from_name: 'SurfCoast Admin',
    });
  },

  // Trigger review reminder emails
  triggerReviewReminders: async () => {
    return await base44.functions.invoke('sendScheduledReviewEmails', {});
  },
};