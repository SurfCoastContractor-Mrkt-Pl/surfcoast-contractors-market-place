import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // SECURITY: Only admins or automated systems can trigger trial reminders
    const user = await base44.auth.me();
    if (user && user.role !== 'admin') {
      console.warn(`[AUTH_VIOLATION] Non-admin user ${user.email} attempted to trigger trialExpirationReminder`);
      return Response.json(
        { error: 'Forbidden: Only admins or scheduled automations can send trial reminders' },
        { status: 403 }
      );
    }

    // Fetch contractors with active trials
    const contractors = await base44.asServiceRole.entities.Contractor.list();
    const customers = await base44.asServiceRole.entities.CustomerProfile.list();

    const now = new Date();
    const results = {
      contractorEmails: 0,
      customerEmails: 0,
      errors: []
    };

    // Process contractors
    for (const contractor of contractors) {
      if (!contractor.trial_active || !contractor.trial_ends_at) continue;

      const trialEndDate = new Date(contractor.trial_ends_at);
      const daysUntilExpiry = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));

      // Send reminders at -7, -3, -1 days
      if ([7, 3, 1].includes(daysUntilExpiry)) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: contractor.email,
            subject: `⏰ Your SurfCoast Trial Expires in ${daysUntilExpiry} Day${daysUntilExpiry > 1 ? 's' : ''}`,
            from_name: 'SurfCoast Marketplace',
            body: `Hi ${contractor.name},\n\nYour SurfCoast contractor trial expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''} (${trialEndDate.toLocaleDateString()}).\n\nUpgrade to continue accessing jobs and managing your profile:\n- Unlimited job access\n- Profile visibility\n- Messaging and quotes\n\nUpgrade now at: https://surfcoast.com/ContractorAccount\n\nQuestions? Reply to this email.\n\nBest,\nSurfCoast Team`
          });
          results.contractorEmails++;
        } catch (error) {
          results.errors.push(`Contractor ${contractor.email}: ${error.message}`);
          console.error(`[trialExpirationReminder] Failed to email contractor ${contractor.email}:`, error.message);
        }
      }
    }

    // Process customers
    for (const customer of customers) {
      if (!customer.trial_active || !customer.trial_ends_at) continue;

      const trialEndDate = new Date(customer.trial_ends_at);
      const daysUntilExpiry = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24));

      if ([7, 3, 1].includes(daysUntilExpiry)) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: customer.email,
            subject: `⏰ Your SurfCoast Trial Expires in ${daysUntilExpiry} Day${daysUntilExpiry > 1 ? 's' : ''}`,
            from_name: 'SurfCoast Marketplace',
            body: `Hi ${customer.full_name},\n\nYour SurfCoast customer trial expires in ${daysUntilExpiry} day${daysUntilExpiry > 1 ? 's' : ''} (${trialEndDate.toLocaleDateString()}).\n\nContinue finding vetted contractors:\n- Access to unlimited job postings\n- Connect with rated professionals\n- Get quotes and manage projects\n\nUpgrade now at: https://surfcoast.com/CustomerAccount\n\nQuestions? Reply to this email.\n\nBest,\nSurfCoast Team`
          });
          results.customerEmails++;
        } catch (error) {
          results.errors.push(`Customer ${customer.email}: ${error.message}`);
          console.error(`[trialExpirationReminder] Failed to email customer ${customer.email}:`, error.message);
        }
      }
    }

    console.log(`[trialExpirationReminder] Sent ${results.contractorEmails} contractor + ${results.customerEmails} customer reminders`);

    return Response.json({
      success: true,
      message: `Sent ${results.contractorEmails} contractor and ${results.customerEmails} customer trial expiration reminders`,
      errors: results.errors.length > 0 ? results.errors : null
    });
  } catch (error) {
    console.error('[trialExpirationReminder] Fatal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});