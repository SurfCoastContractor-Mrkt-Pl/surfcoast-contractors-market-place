/**
 * Scheduled Function: Enforce Account Holds
 * - Locks contractor accounts with missing after photos (72h deadline)
 * - Checks rating compliance
 * - Sends notifications
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const PHOTO_DEADLINE_HOURS = 72;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    console.log('Starting account hold enforcement...');

    // Get all active scopes that might need enforcement
    const scopes = await base44.asServiceRole.entities.ScopeOfWork.list();
    const contractors = await base44.asServiceRole.entities.Contractor.list();
    const contractorMap = new Map(contractors.map(c => [c.id, c]));

    let lockedCount = 0;
    let ratingBlockCount = 0;

    // 1. ENFORCE PHOTO DEADLINES
    for (const scope of scopes) {
      if (scope.status !== 'approved') continue; // Only approved scopes have work dates
      if (scope.after_photo_urls?.length > 0) continue; // Already has photos
      if (!scope.agreed_work_date) continue;

      const workDate = new Date(scope.agreed_work_date);
      const deadline = new Date(workDate.getTime() + PHOTO_DEADLINE_HOURS * 60 * 60 * 1000);
      const now = new Date();

      if (now > deadline) {
        // Lock the contractor's account
        const contractor = contractorMap.get(scope.contractor_id);
        if (contractor && !contractor.account_locked) {
          await base44.asServiceRole.entities.Contractor.update(scope.contractor_id, {
            account_locked: true,
            locked_scope_id: scope.id,
          });
          lockedCount++;

          console.log(`Locked contractor ${scope.contractor_id} for missing after photos on scope ${scope.id}`);

          // Send notification
          await sendLockNotification(base44, contractor, 'after_photos', scope);
        }
      }
    }

    // 2. ENFORCE RATING COMPLIANCE (mutual rating requirement)
    for (const scope of scopes) {
      if (scope.status !== 'pending_ratings') continue;

      // Check if contractor has submitted rating
      const hasContractorRating = scope.contractor_satisfaction_rating;
      const hasClientRating = scope.client_satisfaction_rating;

      // If mutual ratings not complete, activate rating block on contractor
      if (!hasContractorRating && !hasClientRating) {
        const contractor = contractorMap.get(scope.contractor_id);
        if (contractor && !contractor.rating_block_active) {
          // Calculate time since scope was approved (when ratings become required)
          const scopeApprovedTime = new Date(scope.client_signed_scope_at || scope.updated_date);
          const daysSinceApproved = (new Date() - scopeApprovedTime) / (1000 * 60 * 60 * 24);

          // Activate block after 7 days of no ratings submitted
          if (daysSinceApproved > 7) {
            await base44.asServiceRole.entities.Contractor.update(scope.contractor_id, {
              rating_block_active: true,
              pending_rating_scope_id: scope.id,
              rating_block_since: new Date().toISOString(),
            });
            ratingBlockCount++;

            console.log(`Activated rating block on contractor ${scope.contractor_id} for scope ${scope.id}`);

            // Send notification
            await sendLockNotification(base44, contractor, 'rating_block', scope);
          }
        }
      }
    }

    return Response.json({
      success: true,
      message: `Account hold enforcement complete: ${lockedCount} accounts locked, ${ratingBlockCount} rating blocks activated`,
      stats: { lockedCount, ratingBlockCount },
    });
  } catch (error) {
    console.error('Error in enforceAccountHolds:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function sendLockNotification(base44, contractor, type, scope) {
  const subject = type === 'after_photos'
    ? 'Account Locked: Missing After-Work Photos'
    : 'Account Restricted: Rating Submission Required';

  const message = type === 'after_photos'
    ? `Your account has been locked because you did not submit after-work photos within 72 hours of the agreed work date (${scope.agreed_work_date}). Please submit photos to unlock your account.`
    : `Your account is temporarily restricted. Please submit a rating for your recent job to continue accessing the platform.`;

  try {
    await base44.integrations.Core.SendEmail({
      to: contractor.email,
      subject,
      body: `Hello ${contractor.name},\n\n${message}\n\nPlease log in to your account to resolve this issue.\n\nBest,\nSurfCoast Team`,
    });
  } catch (emailError) {
    console.error(`Failed to send notification email to ${contractor.email}:`, emailError);
  }
}