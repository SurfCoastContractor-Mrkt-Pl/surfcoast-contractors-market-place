import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized: Authentication required' }, { status: 401 });
    }

    const { milestone_id, new_status, progress_percentage, approval_notes } = await req.json();

    if (!milestone_id || !new_status || !['pending', 'in_progress', 'completed', 'approved'].includes(new_status)) {
      return Response.json({ error: 'Invalid milestone_id or status' }, { status: 400 });
    }

    // Get milestone details
    const milestone = await base44.asServiceRole.entities.ProjectMilestone.filter({ id: milestone_id });
    if (!milestone || milestone.length === 0) {
      return Response.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestoneData = milestone[0];
    const scope = await base44.asServiceRole.entities.ScopeOfWork.filter({ id: milestoneData.scope_id });
    
    if (!scope || scope.length === 0) {
      return Response.json({ error: 'Associated scope not found' }, { status: 404 });
    }

    const scopeData = scope[0];

    // Authorize: User must be contractor or customer involved in the scope
    const isContractorInScope = user.email === scopeData.contractor_email;
    const isCustomerInScope = user.email === scopeData.customer_email;
    
    if (!isContractorInScope && !isCustomerInScope) {
      return Response.json({ error: 'Forbidden: You are not authorized to update this milestone' }, { status: 403 });
    }
    const now = new Date();
    const updatePayload = { status: new_status };

    // Add timestamp and user info based on status
    if (new_status === 'in_progress') {
      updatePayload.progress_percentage = progress_percentage || 0;
    } else if (new_status === 'completed') {
      updatePayload.completed_date = now.toISOString().split('T')[0];
      updatePayload.progress_percentage = 100;
      const user = await base44.auth.me();
      if (user) {
        updatePayload.completed_by = user.email;
      }
    } else if (new_status === 'approved') {
      updatePayload.approved_date = now.toISOString().split('T')[0];
      updatePayload.approval_notes = approval_notes || '';
      const user = await base44.auth.me();
      if (user) {
        updatePayload.approved_by = user.email;
      }
    }

    // Update milestone
    const updatedMilestone = await base44.asServiceRole.entities.ProjectMilestone.update(milestone_id, updatePayload);

    // Send notification email to relevant party
    let notificationEmail = '';
    let notificationSubject = '';
    let notificationBody = '';

    const isContractor = updatePayload.completed_by;
    const isClient = updatePayload.approved_by;

    if (new_status === 'in_progress') {
      notificationEmail = scopeData.customer_email;
      notificationSubject = `📊 Milestone Update: "${milestoneData.title}" is now in progress`;
      notificationBody = `Hi ${scopeData.customer_name},\n\n${scopeData.contractor_name} has started work on: "${milestoneData.title}"\n\nProgress: ${progress_percentage || 0}%\n\nYou can track the progress in your project dashboard.\n\nBest regards,\nSurfCoast Team`;
    } else if (new_status === 'completed') {
      notificationEmail = scopeData.customer_email;
      notificationSubject = `✅ Milestone Complete: "${milestoneData.title}" is ready for review`;
      notificationBody = `Hi ${scopeData.customer_name},\n\n${scopeData.contractor_name} has completed: "${milestoneData.title}"\n\nPlease review and approve when ready. You can view details in your project dashboard.\n\nBest regards,\nSurfCoast Team`;
    } else if (new_status === 'approved') {
      notificationEmail = scopeData.contractor_email;
      notificationSubject = `🎉 Milestone Approved: "${milestoneData.title}"`;
      notificationBody = `Hi ${scopeData.contractor_name},\n\n${scopeData.customer_name} has approved your completion of: "${milestoneData.title}"\n\n${approval_notes ? `Their notes: "${approval_notes}"` : 'Thank you for your excellent work!'}\n\nBest regards,\nSurfCoast Team`;
    }

    // Send email notification
    if (notificationEmail) {
      try {
        await base44.integrations.Core.SendEmail({
          to: notificationEmail,
          subject: notificationSubject,
          body: notificationBody
        });
      } catch (emailError) {
        console.error('Failed to send milestone notification email:', emailError);
        // Continue despite email failure
      }
    }

    // Create project message for transparent communication
    try {
      const messageMap = {
        'in_progress': `Started work on: ${milestoneData.title} (${progress_percentage || 0}% progress)`,
        'completed': `Completed: ${milestoneData.title} - Ready for your review`,
        'approved': `Approved: ${milestoneData.title}${approval_notes ? ` - "${approval_notes}"` : ''}`
      };

      const message = messageMap[new_status];
      const user = await base44.auth.me();

      if (message && user) {
        await base44.asServiceRole.entities.ProjectMessage.create({
          scope_id: milestoneData.scope_id,
          sender_email: user.email,
          sender_name: user.full_name || user.email,
          sender_type: isContractor ? 'contractor' : 'customer',
          message: message,
          read: false
        });
      }
    } catch (msgError) {
      console.error('Failed to create project message:', msgError);
      // Continue despite message failure
    }

    return Response.json({
      success: true,
      milestone_id,
      new_status,
      milestone_title: milestoneData.title,
      scope_id: milestoneData.scope_id,
      notification_sent: !!notificationEmail,
      notification_email: notificationEmail,
      updated_at: now.toISOString()
    });
  } catch (error) {
    console.error('Error updating milestone status:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});