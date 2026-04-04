// Subscription tier limits
export const TIER_LIMITS = {
  starter: {
    activeJobs: 5,
    monthlyJobsPosted: 5,
    proposalsPerMonth: 20,
    messageLimit: 10,
  },
  pro: {
    activeJobs: 15,
    monthlyJobsPosted: 15,
    proposalsPerMonth: 50,
    messageLimit: 100,
  },
  max: {
    activeJobs: Infinity,
    monthlyJobsPosted: Infinity,
    proposalsPerMonth: Infinity,
    messageLimit: Infinity,
  },
  premium: {
    activeJobs: Infinity,
    monthlyJobsPosted: Infinity,
    proposalsPerMonth: Infinity,
    messageLimit: Infinity,
  },
  residential: {
    activeJobs: Infinity,
    monthlyJobsPosted: Infinity,
    proposalsPerMonth: Infinity,
    messageLimit: Infinity,
  },
};

/**
 * Get tier limits for a subscription
 */
export function getTierLimits(tier) {
  return TIER_LIMITS[tier] || TIER_LIMITS.starter;
}

/**
 * Check if user can post a new job
 */
export async function canUserPostJob(subscription, jobsPostedThisMonth) {
  if (!subscription || subscription.status !== 'active') {
    return { allowed: false, reason: 'No active subscription' };
  }

  const limits = getTierLimits(subscription.tier);
  if (jobsPostedThisMonth >= limits.monthlyJobsPosted) {
    return {
      allowed: false,
      reason: `You've reached your monthly job posting limit (${limits.monthlyJobsPosted}). Upgrade your plan or wait until next month.`,
      limit: limits.monthlyJobsPosted,
      current: jobsPostedThisMonth,
    };
  }

  return { allowed: true };
}

/**
 * Check if user has active job slots available
 */
export async function canUserHaveActiveJob(subscription, activeJobCount) {
  if (!subscription || subscription.status !== 'active') {
    return { allowed: false, reason: 'No active subscription' };
  }

  const limits = getTierLimits(subscription.tier);
  if (activeJobCount >= limits.activeJobs) {
    return {
      allowed: false,
      reason: `You can only have ${limits.activeJobs} active jobs at once. Complete or close a job first.`,
      limit: limits.activeJobs,
      current: activeJobCount,
    };
  }

  return { allowed: true };
}

/**
 * Check if user can send a message
 */
export async function canUserSendMessage(subscription, messagesThisMonth) {
  if (!subscription || subscription.status !== 'active') {
    return { allowed: false, reason: 'No active subscription' };
  }

  const limits = getTierLimits(subscription.tier);
  if (messagesThisMonth >= limits.messageLimit) {
    return {
      allowed: false,
      reason: `You've reached your monthly messaging limit (${limits.messageLimit}). Upgrade to send more messages.`,
      limit: limits.messageLimit,
      current: messagesThisMonth,
    };
  }

  return { allowed: true };
}

/**
 * Get usage progress for a tier
 */
export function getUsageProgress(subscription, usage) {
  const limits = getTierLimits(subscription?.tier);
  return {
    jobsPosted: {
      used: usage.jobsPostedThisMonth || 0,
      limit: limits.monthlyJobsPosted,
      percentage:
        limits.monthlyJobsPosted === Infinity
          ? 0
          : ((usage.jobsPostedThisMonth || 0) / limits.monthlyJobsPosted) * 100,
    },
    activeJobs: {
      used: usage.activeJobCount || 0,
      limit: limits.activeJobs,
      percentage:
        limits.activeJobs === Infinity ? 0 : ((usage.activeJobCount || 0) / limits.activeJobs) * 100,
    },
    messages: {
      used: usage.messagesThisMonth || 0,
      limit: limits.messageLimit,
      percentage:
        limits.messageLimit === Infinity
          ? 0
          : ((usage.messagesThisMonth || 0) / limits.messageLimit) * 100,
    },
  };
}