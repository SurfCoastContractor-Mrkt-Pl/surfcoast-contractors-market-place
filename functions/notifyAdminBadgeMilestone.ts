import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, count, type } = await req.json();

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
    console.error('notifyAdminBadgeMilestone error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});