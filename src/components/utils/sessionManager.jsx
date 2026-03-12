import { base44 } from '@/api/base44Client';

/**
 * Session Manager for messaging tiers
 * Tracks sessions, enforces limits, and validates communication eligibility
 */

export const canCommunicate = (userType, otherUserType) => {
  return userType !== otherUserType;
};

export const getUserSubscription = async (userEmail) => {
  const subs = await base44.entities.Subscription.filter({
    user_email: userEmail,
    status: 'active',
  });
  return subs?.[0] || null;
};

export const getUniqueContactCount = async (userEmail) => {
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const messages = await base44.entities.Message.filter({
    sender_email: userEmail,
  });

  const uniqueRecipients = new Set(
    messages
      .filter(m => new Date(m.created_date) > oneMonthAgo)
      .map(m => m.recipient_email)
  );

  return uniqueRecipients.size;
};

export const getSessionCount = async (userEmail, otherUserEmail) => {
  const messages = await base44.entities.Message.filter({
    $or: [
      { sender_email: userEmail, recipient_email: otherUserEmail },
      { sender_email: otherUserEmail, recipient_email: userEmail },
    ],
  });

  if (messages.length === 0) return 0;

  let sessionCount = 1;
  let lastMessageTime = new Date(messages[0].created_date);

  for (let i = 1; i < messages.length; i++) {
    const msgTime = new Date(messages[i].created_date);
    const gapMinutes = (msgTime - lastMessageTime) / (1000 * 60);

    if (gapMinutes > 30) {
      sessionCount++;
    }
    lastMessageTime = msgTime;
  }

  return sessionCount;
};

export const canStartNewSession = async (userEmail, otherUserEmail) => {
  const sessionCount = await getSessionCount(userEmail, otherUserEmail);
  return sessionCount < 5;
};

export const getTimedSessionExpiration = (paymentRecord) => {
  if (!paymentRecord?.confirmed_at) return null;
  const expiresAt = new Date(paymentRecord.confirmed_at);
  expiresAt.setMinutes(expiresAt.getMinutes() + 10);
  return expiresAt;
};

export const isTimedSessionActive = (expirationTime) => {
  return new Date() < new Date(expirationTime);
};

export const validateMessagingEligibility = async (userEmail, userType, otherUserEmail, otherUserType, tier) => {
  try {
    const response = await base44.functions.invoke('validateMessagingEligibility', {
      otherUserEmail,
      otherUserType
    });
    return response.data;
  } catch (error) {
    console.error('Error validating messaging eligibility:', error);
    return { allowed: false, reason: 'Unable to validate eligibility' };
  }
};