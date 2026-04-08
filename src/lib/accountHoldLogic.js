/**
 * Account Hold Enforcement Logic
 * - 72-hour after-photo deadline enforcement
 * - Mutual rating requirement enforcement
 * - Overdue job completion enforcement (expected_completion_date exceeded)
 * - Deletion-pending status (billing cycle ended, card removed, account queued for deletion)
 */

/**
 * Check if contractor account should be locked due to missing after photos
 * @param {Object} scope - ScopeOfWork data
 * @returns {Object} { shouldLock: boolean, daysOverdue: number, deadline: string }
 */
export const checkAfterPhotoDeadline = (scope) => {
  if (!scope?.agreed_work_date) return { shouldLock: false, daysOverdue: 0, deadline: null };

  const workDate = new Date(scope.agreed_work_date);
  const deadline = new Date(workDate.getTime() + 72 * 60 * 60 * 1000); // 72 hours later
  const now = new Date();

  if (now > deadline && (!scope?.after_photo_urls || scope.after_photo_urls.length === 0)) {
    const daysOverdue = Math.floor((now - deadline) / (1000 * 60 * 60 * 24));
    return { shouldLock: true, daysOverdue, deadline: deadline.toISOString() };
  }

  return { shouldLock: false, daysOverdue: 0, deadline: deadline.toISOString() };
};

/**
 * Check if contractor has pending unsubmitted rating
 * @param {Object} contractor - Contractor data
 * @returns {boolean} True if contractor has pending rating block
 */
export const hasPendingRatingBlock = (contractor) => {
  return contractor?.rating_block_active === true && !!contractor?.pending_rating_scope_id;
};

/**
 * Get account hold status
 * @param {Object} contractor - Contractor data
 * @param {Array} scopes - Array of ScopeOfWork records
 * @returns {Object} { isLocked: boolean, reasons: Array, overdue: Object }
 */
export const getAccountHoldStatus = (contractor, scopes = []) => {
  const reasons = [];
  let overdue = null;

  // Check for account_locked flag (set when after-photo deadline exceeded)
  if (contractor?.account_locked === true) {
    reasons.push({
      type: 'missing_after_photos',
      message: 'Account locked: Missing after-photos past 72-hour deadline',
      scopeId: contractor?.locked_scope_id,
    });
    overdue = contractor?.locked_scope_id;
  }

  // Check for rating block
  if (hasPendingRatingBlock(contractor)) {
    reasons.push({
      type: 'pending_rating',
      message: 'Account blocked: Pending rating submission required',
      scopeId: contractor?.pending_rating_scope_id,
    });
  }

  return {
    isLocked: reasons.length > 0,
    reasons,
    overdue,
  };
};

/**
 * Check if contractor can access a specific feature
 * @param {Object} contractor - Contractor data
 * @param {string} feature - Feature name: 'post_job', 'message', 'checkout', 'bid'
 * @param {Array} scopes - Array of ScopeOfWork records (optional, for photo checks)
 * @returns {Object} { allowed: boolean, blockedReason: string }
 */
export const canAccessFeature = (contractor, feature, scopes = []) => {
  const holdStatus = getAccountHoldStatus(contractor, scopes);

  if (!holdStatus.isLocked) {
    return { allowed: true, blockedReason: null };
  }

  // All features blocked if account is on hold
  const reasonText = holdStatus.reasons.map(r => r.message).join('; ');
  return {
    allowed: false,
    blockedReason: reasonText,
    holdStatus,
  };
};

/**
 * Calculate days until after-photo deadline
 * @param {string} agreedWorkDate - ISO date string of agreed work date
 * @returns {number} Days remaining (negative if overdue)
 */
export const daysUntilPhotoDeadline = (agreedWorkDate) => {
  if (!agreedWorkDate) return null;
  const workDate = new Date(agreedWorkDate);
  const deadline = new Date(workDate.getTime() + 72 * 60 * 60 * 1000);
  const now = new Date();
  return Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
};