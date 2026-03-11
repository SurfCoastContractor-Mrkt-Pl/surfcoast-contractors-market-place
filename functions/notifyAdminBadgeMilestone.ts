import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Require admin authentication
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { name, email, count, type } = await req.json();

    // Validate inputs
    if (!name || !email || !count || !type) {
      return Response.json({ error: 'name, email, count, and type are required' }, { status: 400 });
    }

    if (!['contractor', 'customer'].includes(type)) {
      return Response.json({ error: 'type must be "contractor" or "customer"' }, { status: 400 });
    }

    // Verify the user/badge milestone actually exists and has the claimed count
    if (type === 'contractor') {
      const contractors = await base44.asServiceRole.entities.Contractor.filter({ email });
      if (!contractors || contractors.length === 0) {
        return Response.json({ error: 'Contractor not found' }, { status: 404 });
      }
      if (contractors[0].completed_jobs_count !== count) {
        return Response.json({ error: 'Completed jobs count does not match database record' }, { status: 400 });
      }
    } else {
      const customers = await base44.asServiceRole.entities.CustomerProfile.filter({ email });
      if (!customers || customers.length === 0) {
        return Response.json({ error: 'Customer not found' }, { status: 404 });
      }
      if (customers[0].completed_jobs_count !== count) {
        return Response.json({ error: 'Completed jobs count does not match database record' }, { status: 400 });
      }
    }

    const adminEmail = Deno.env.get('ADMIN_ALERT_EMAIL');
    if (!adminEmail) {
      console.error('ADMIN_ALERT_EMAIL is not configured');
      return Response.json({ error: 'Admin email not configured' }, { status: 500 });
    }

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminEmail,
      from_name: 'SurfCoast Contractor Market Place',
      subject: `🌊 SurfCoast Legend Achieved — ${type === 'contractor' ? 'Contractor' : 'Customer'}`,
      body: `${type === 'contractor' ? 'Contractor' : 'Customer'} ${name} (${email}) has just reached ${count} verified completed jobs and earned the SurfCoast Legend badge!\n\nConsider reaching out to congratulate them.`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyAdminBadgeMilestone error');
    return Response.json({ error: 'Failed to send notification' }, { status: 500 });
  }
});