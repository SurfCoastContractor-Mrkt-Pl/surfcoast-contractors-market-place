import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  const requestId = crypto.randomUUID();
  try {
    const base44 = createClientFromRequest(req);

    // Must be authenticated and authorized
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { accountType, accountEmail } = await req.json();

    if (!accountType || !accountEmail) {
      return Response.json({ error: 'accountType and accountEmail required' }, { status: 400 });
    }

    if (!['contractor', 'customer'].includes(accountType)) {
      return Response.json({ error: 'accountType must be contractor or customer' }, { status: 400 });
    }

    // Strict authorization: only admin role can invoke cascading delete via service role
    // Users cannot delete any account other than their own, but must use limited deletion only
    if (user.role !== 'admin') {
      if (user.email !== accountEmail) {
        console.warn(`Unauthorized account deletion attempt: ${user.email} tried to delete ${accountEmail}`);
        return Response.json({ error: 'Forbidden: You can only delete your own account.' }, { status: 403 });
      }
      // Non-admin users cannot use this function (requires service role escalation)
      return Response.json({ error: 'Forbidden: Use your account settings to delete your account.' }, { status: 403 });
    }

    let contractorId = null;
    let deletedCount = 0;

    // If contractor, get the ID first
    if (accountType === 'contractor') {
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: accountEmail });
      if (contractors.length === 0) {
        return Response.json({ success: true, message: 'Contractor account not found', deletedRecords: 0 });
      }
      contractorId = contractors[0].id;
    }

    // Check if customer exists (for customer deletion)
    if (accountType === 'customer') {
      const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ email: accountEmail });
      if (customers.length === 0) {
        return Response.json({ success: true, message: 'Customer account not found', deletedRecords: 0 });
      }
    }

    // Helper function to log deletion
    const logDeletion = async (entityName, entityId) => {
      try {
        await base44.asServiceRole.entities.DeletionAuditLog.create({
          deleted_by_email: user.email,
          deleted_by_role: user.role || 'user',
          account_type: accountType,
          account_email: accountEmail,
          entity_name: entityName,
          entity_id: entityId,
          deletion_reason: 'account_deletion',
          deleted_at: new Date().toISOString()
        });
      } catch (logError) {
        console.error(`Failed to log deletion of ${entityName}:`, logError.message);
      }
    };

    // Delete related records based on account type
    if (accountType === 'contractor') {
      // Delete all contractor scope proposals
      const proposals = await base44.asServiceRole.entities.ContractorScopeProposal.filter({ contractor_id: contractorId });
      for (const proposal of proposals) {
        await base44.asServiceRole.entities.ContractorScopeProposal.delete(proposal.id);
        await logDeletion('ContractorScopeProposal', proposal.id);
        deletedCount++;
      }

      // Delete all scopes where this contractor is involved
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ contractor_id: contractorId });
      for (const scope of scopes) {
        await base44.asServiceRole.entities.ScopeOfWork.delete(scope.id);
        await logDeletion('ScopeOfWork', scope.id);
        deletedCount++;
      }

      // Delete all messages sent by this contractor
      const messages = await base44.asServiceRole.entities.Message.filter({ sender_email: accountEmail });
      for (const msg of messages) {
        await base44.asServiceRole.entities.Message.delete(msg.id);
        await logDeletion('Message', msg.id);
        deletedCount++;
      }

      // Delete all reviews for this contractor
      const reviews = await base44.asServiceRole.entities.Review.filter({ contractor_id: contractorId });
      for (const review of reviews) {
        await base44.asServiceRole.entities.Review.delete(review.id);
        await logDeletion('Review', review.id);
        deletedCount++;
      }

      // Delete all payments from this contractor
      const payments = await base44.asServiceRole.entities.Payment.filter({ payer_email: accountEmail, payer_type: 'contractor' });
      for (const payment of payments) {
        await base44.asServiceRole.entities.Payment.delete(payment.id);
        await logDeletion('Payment', payment.id);
        deletedCount++;
      }

      // Delete contractor profile
      await base44.asServiceRole.entities.Contractor.delete(contractorId);
      await logDeletion('Contractor', contractorId);
      deletedCount++;
    } else {
      // Customer account deletion
      // Delete all customer scope requests
      const scopeRequests = await base44.asServiceRole.entities.CustomerScopeRequest.filter({ customer_email: accountEmail });
      for (const scopeReq of scopeRequests) {
        await base44.asServiceRole.entities.CustomerScopeRequest.delete(scopeReq.id);
        await logDeletion('CustomerScopeRequest', scopeReq.id);
        deletedCount++;
      }

      // Delete all scopes where this customer is involved
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ customer_email: accountEmail });
      for (const scope of scopes) {
        await base44.asServiceRole.entities.ScopeOfWork.delete(scope.id);
        await logDeletion('ScopeOfWork', scope.id);
        deletedCount++;
      }

      // Delete all messages sent by this customer
      const messages = await base44.asServiceRole.entities.Message.filter({ sender_email: accountEmail });
      for (const msg of messages) {
        await base44.asServiceRole.entities.Message.delete(msg.id);
        await logDeletion('Message', msg.id);
        deletedCount++;
      }

      // Delete all payments from this customer
      const payments = await base44.asServiceRole.entities.Payment.filter({ payer_email: accountEmail, payer_type: 'customer' });
      for (const payment of payments) {
        await base44.asServiceRole.entities.Payment.delete(payment.id);
        await logDeletion('Payment', payment.id);
        deletedCount++;
      }

      // Delete all disclaimer acceptances
      const disclaimers = await base44.asServiceRole.entities.DisclaimerAcceptance.filter({ customer_email: accountEmail });
      for (const disclaimer of disclaimers) {
        await base44.asServiceRole.entities.DisclaimerAcceptance.delete(disclaimer.id);
        await logDeletion('DisclaimerAcceptance', disclaimer.id);
        deletedCount++;
      }

      // Delete customer profile
      const profiles = await base44.asServiceRole.entities.CustomerProfile.filter({ email: accountEmail });
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.CustomerProfile.delete(profiles[0].id);
        await logDeletion('CustomerProfile', profiles[0].id);
        deletedCount++;
      }

      // Delete all jobs posted by this customer
      const jobs = await base44.asServiceRole.entities.Job.filter({ poster_email: accountEmail });
      for (const job of jobs) {
        await base44.asServiceRole.entities.Job.delete(job.id);
        await logDeletion('Job', job.id);
        deletedCount++;
      }
    }

    console.log(`Account deletion cascaded: deleted ${deletedCount} related records`);
    return Response.json({ success: true, deletedRecords: deletedCount });
  } catch (error) {
    console.error(`[${requestId}] Account deletion error:`, error.message);
    return Response.json({ error: 'Failed to delete account', requestId }, { status: 500 });
  }
});