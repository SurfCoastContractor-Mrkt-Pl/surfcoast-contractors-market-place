import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Get all users
    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

    // Get all contractors and customer profiles
    const [contractors, customers] = await Promise.all([
      base44.asServiceRole.entities.Contractor.list('-created_date', 1000),
      base44.asServiceRole.entities.CustomerProfile.list('-created_date', 1000),
    ]);

    const contractorEmails = new Set(contractors.map(c => c.email));
    const customerEmails = new Set(customers.map(c => c.email));
    const incompleteContractors = contractors.filter(c => !c.profile_complete);

    // Find users with no profile at all (signed up but never chose a role)
    const noProfileUsers = allUsers.filter(u =>
      !contractorEmails.has(u.email) && !customerEmails.has(u.email)
    );

    const results = { emailsSent: 0, errors: [] };

    // Send check-in emails to incomplete contractor profiles
    for (const contractor of incompleteContractors) {
      try {
        const completionPct = contractor.profile_completion_percent || 0;
        const missingItems = [];
        if (!contractor.photo_url) missingItems.push('profile photo');
        if (!contractor.bio) missingItems.push('bio');
        if (!contractor.id_document_url) missingItems.push('ID document');
        if (!contractor.face_photo_url) missingItems.push('face photo');
        if (!contractor.line_of_work && !contractor.trade_specialty) missingItems.push('line of work');
        if (!contractor.location) missingItems.push('location');

        const missingText = missingItems.length > 0
          ? `\n\nHere's what's still missing from your profile:\n${missingItems.map(m => `• ${m}`).join('\n')}`
          : '';

        await base44.asServiceRole.integrations.Core.SendEmail({
          to: contractor.email,
          subject: `Hey ${contractor.name?.split(' ')[0] || 'there'} — your SurfCoast profile is ${completionPct}% complete 👋`,
          body: `Hi ${contractor.name?.split(' ')[0] || 'there'},

We noticed your SurfCoast Contractors Market Place profile is still incomplete (${completionPct}% done). Completing your profile helps you get discovered by customers looking for someone with your skills!${missingText}

Have questions about how the platform works, what to include in your profile, or anything else? Our AI Assistant is available 24/7 to help guide you through it.

👉 Log in and chat with the AI Assistant anytime at surfcoastcmp.com

We're here to help you succeed. If there's anything holding you back, just reply to this email and we'll get back to you.

— The SurfCoast Team`,
        });
        results.emailsSent++;
      } catch (err) {
        results.errors.push({ email: contractor.email, error: err.message });
      }
    }

    // Send check-in emails to users with no profile at all
    for (const u of noProfileUsers) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: u.email,
          subject: `${u.full_name?.split(' ')[0] || 'Hey'} — finish setting up your SurfCoast account 🌊`,
          body: `Hi ${u.full_name?.split(' ')[0] || 'there'},

You signed up for SurfCoast Contractors Market Place but haven't completed your profile yet. Whether you're here to offer your skills or find someone to help with a project, we'd love to get you set up!

Here's how to get started:
• If you offer services → Complete your Entrepreneur/Contractor profile
• If you need work done → Set up your Customer profile and post a job

Not sure where to begin? Our AI Assistant can walk you through everything — from what the platform is, to how to sign up, to answering any questions you have.

👉 Log in and chat with the AI Assistant: surfcoastcmp.com

We're excited to have you. Let us know if we can help!

— The SurfCoast Team`,
        });
        results.emailsSent++;
      } catch (err) {
        results.errors.push({ email: u.email, error: err.message });
      }
    }

    console.log(`Check-in complete: ${results.emailsSent} emails sent, ${results.errors.length} errors`);
    return Response.json({
      success: true,
      emailsSent: results.emailsSent,
      incompleteContractors: incompleteContractors.length,
      noProfileUsers: noProfileUsers.length,
      errors: results.errors,
    });
  } catch (error) {
    console.error('checkInIncompleteUsers error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});