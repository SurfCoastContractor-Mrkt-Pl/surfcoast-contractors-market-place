import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accountType, accountEmail } = await req.json();

    if (!accountType || !accountEmail) {
      return Response.json({ error: 'accountType and accountEmail required' }, { status: 400 });
    }

    if (!['contractor', 'customer'].includes(accountType)) {
      return Response.json({ error: 'accountType must be contractor or customer' }, { status: 400 });
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

    // Delete related records based on account type
    if (accountType === 'contractor') {
      // Delete all contractor scope proposals
      const proposals = await base44.asServiceRole.entities.ContractorScopeProposal.filter({ contractor_id: contractorId });
      for (const proposal of proposals) {
        await base44.asServiceRole.entities.ContractorScopeProposal.delete(proposal.id);
        deletedCount++;
      }

      // Delete all scopes where this contractor is involved
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ contractor_id: contractorId });
      for (const scope of scopes) {
        await base44.asServiceRole.entities.ScopeOfWork.delete(scope.id);
        deletedCount++;
      }

      // Delete all messages sent by this contractor
      const messages = await base44.asServiceRole.entities.Message.filter({ sender_email: accountEmail });
      for (const msg of messages) {
        await base44.asServiceRole.entities.Message.delete(msg.id);
        deletedCount++;
      }

      // Delete all reviews for this contractor
      const reviews = await base44.asServiceRole.entities.Review.filter({ contractor_id: contractorId });
      for (const review of reviews) {
        await base44.asServiceRole.entities.Review.delete(review.id);
        deletedCount++;
      }

      // Delete all payments from this contractor
      const payments = await base44.asServiceRole.entities.Payment.filter({ payer_email: accountEmail, payer_type: 'contractor' });
      for (const payment of payments) {
        await base44.asServiceRole.entities.Payment.delete(payment.id);
        deletedCount++;
      }

      // Delete contractor profile
      await base44.asServiceRole.entities.Contractor.delete(contractorId);
      deletedCount++;
    } else {
      // Customer account deletion
      // Delete all customer scope requests
      const scopeRequests = await base44.asServiceRole.entities.CustomerScopeRequest.filter({ customer_email: accountEmail });
      for (const scopeReq of scopeRequests) {
        await base44.asServiceRole.entities.CustomerScopeRequest.delete(scopeReq.id);
        deletedCount++;
      }

      // Delete all scopes where this customer is involved
      const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({ customer_email: accountEmail });
      for (const scope of scopes) {
        await base44.asServiceRole.entities.ScopeOfWork.delete(scope.id);
        deletedCount++;
      }

      // Delete all messages sent by this customer
      const messages = await base44.asServiceRole.entities.Message.filter({ sender_email: accountEmail });
      for (const msg of messages) {
        await base44.asServiceRole.entities.Message.delete(msg.id);
        deletedCount++;
      }

      // Delete all payments from this customer
      const payments = await base44.asServiceRole.entities.Payment.filter({ payer_email: accountEmail, payer_type: 'customer' });
      for (const payment of payments) {
        await base44.asServiceRole.entities.Payment.delete(payment.id);
        deletedCount++;
      }

      // Delete all disclaimer acceptances
      const disclaimers = await base44.asServiceRole.entities.DisclaimerAcceptance.filter({ customer_email: accountEmail });
      for (const disclaimer of disclaimers) {
        await base44.asServiceRole.entities.DisclaimerAcceptance.delete(disclaimer.id);
        deletedCount++;
      }

      // Delete customer profile
      const profiles = await base44.asServiceRole.entities.CustomerProfile.filter({ email: accountEmail });
      if (profiles.length > 0) {
        await base44.asServiceRole.entities.CustomerProfile.delete(profiles[0].id);
        deletedCount++;
      }

      // Delete all jobs posted by this customer
      const jobs = await base44.asServiceRole.entities.Job.filter({ poster_email: accountEmail });
      for (const job of jobs) {
        await base44.asServiceRole.entities.Job.delete(job.id);
        deletedCount++;
      }
    }

    console.log(`Account deletion cascaded: deleted ${deletedCount} related records`);
    return Response.json({ success: true, deletedRecords: deletedCount });
  } catch (error) {
    console.error('Account deletion error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});