import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return Response.json({ error: 'Email is required' }, { status: 400 });
    }

    // Only allow a user to sync their own profile, unless they are an admin
    if (user.email.toLowerCase() !== email.toLowerCase() && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: You can only sync your own profile' }, { status: 403 });
    }

    // Get CustomerProfile
    const customerProfiles = await base44.asServiceRole.entities.CustomerProfile.filter({ email });
    if (!customerProfiles || customerProfiles.length === 0) {
      return Response.json({ error: 'CustomerProfile not found' }, { status: 404 });
    }

    const customerProfile = customerProfiles[0];
    const fullName = customerProfile.full_name;

    if (!fullName) {
      return Response.json({ error: 'CustomerProfile has no full_name' }, { status: 400 });
    }

    // Update User entity
    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (!users || users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    await base44.asServiceRole.entities.User.update(users[0].id, { full_name: fullName });

    return Response.json({
      success: true,
      message: `Updated user ${email} with full_name: ${fullName}`,
      updated: { email, fullName }
    });
  } catch (error) {
    console.error('Error syncing customer profile name:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});