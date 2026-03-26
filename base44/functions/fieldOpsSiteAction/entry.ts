import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { action, scope_id, location, photo_urls, note } = body;

    if (!scope_id || !action) {
      return Response.json({ error: 'Missing scope_id or action' }, { status: 400 });
    }

    // Fetch scope with user context (respects RLS)
    const scopes = await base44.entities.ScopeOfWork.filter({ id: scope_id });
    const scope = scopes?.[0];
    if (!scope) return Response.json({ error: 'Scope not found', details: 'You do not have access to this scope' }, { status: 404 });

    // Verify ownership: only the assigned contractor can perform actions
    if (scope.contractor_email !== user.email) {
      return Response.json({ error: 'Forbidden: You are not assigned to this job' }, { status: 403 });
    }

    const now = new Date().toISOString();
    let updateData = {};
    let emailSubject = '';
    let emailBody = '';

    if (action === 'checkin') {
      updateData = {
        contractor_checkin_time: now,
        contractor_checkin_location: location || null,
      };
      emailSubject = `✅ ${scope.contractor_name} has arrived at your job site`;
      emailBody = `Hi ${scope.customer_name},\n\nGreat news! Your contractor <strong>${scope.contractor_name}</strong> has checked in at the job site for:\n\n<strong>${scope.job_title}</strong>\n\n📍 Check-in time: ${new Date(now).toLocaleString()}\n${location ? `📌 Location: ${location}\n` : ''}\nWe'll keep you updated as work progresses.\n\n— SurfCoast Marketplace`;
    } else if (action === 'checkout') {
      updateData = {
        contractor_checkout_time: now,
        contractor_checkout_location: location || null,
      };
      emailSubject = `🏁 ${scope.contractor_name} has completed work for today`;
      emailBody = `Hi ${scope.customer_name},\n\nYour contractor <strong>${scope.contractor_name}</strong> has checked out from the job site for:\n\n<strong>${scope.job_title}</strong>\n\n🕐 Check-out time: ${new Date(now).toLocaleString()}\n${note ? `📝 Notes: ${note}\n` : ''}\nIf you have any questions, please contact them through the platform.\n\n— SurfCoast Marketplace`;
    } else if (action === 'photo_update') {
      // Append new photos to existing field_ops_photos array
      const existing = scope.field_ops_photo_urls || [];
      updateData = {
        field_ops_photo_urls: [...existing, ...(photo_urls || [])],
        field_ops_last_photo_at: now,
      };
      emailSubject = `📸 New job site photos from ${scope.contractor_name}`;
      emailBody = `Hi ${scope.customer_name},\n\nYour contractor <strong>${scope.contractor_name}</strong> has uploaded ${photo_urls?.length || 0} new photo(s) from the job site for:\n\n<strong>${scope.job_title}</strong>\n\n${note ? `📝 Notes: ${note}\n` : ''}Log into your SurfCoast account to view the latest progress photos.\n\n— SurfCoast Marketplace`;
    } else {
      return Response.json({ error: 'Unknown action' }, { status: 400 });
    }

    // Update scope with user context (respects RLS and contractor ownership)
    await base44.entities.ScopeOfWork.update(scope_id, updateData);

    // Send email notification to customer
    if (scope.customer_email) {
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: scope.customer_email,
        subject: emailSubject,
        body: emailBody,
      });
    }

    return Response.json({ success: true, action, timestamp: now });
  } catch (error) {
    console.error('fieldOpsSiteAction error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});