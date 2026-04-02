import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user?.email) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deviceId, deviceType, platform, appVersion } = await req.json();
    if (!deviceId || !deviceType || !platform) {
      return Response.json({ error: 'Missing device info' }, { status: 400 });
    }

    // Store device registration
    const existing = await base44.entities.MobileDevice?.filter({
      user_email: user.email,
      device_id: deviceId,
    });

    if (existing?.length > 0) {
      await base44.entities.MobileDevice.update(existing[0].id, {
        last_active: new Date().toISOString(),
        app_version: appVersion,
      });
    } else {
      await base44.entities.MobileDevice?.create({
        user_email: user.email,
        device_id: deviceId,
        device_type: deviceType,
        platform,
        app_version: appVersion,
        is_active: true,
      });
    }

    return Response.json({ registered: true });
  } catch (error) {
    console.error('Mobile device registration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});