import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { notify_badge_earned, show_on_leaderboard } = await req.json();

    // Find existing CustomerProfile
    const profiles = await base44.entities.CustomerProfile.filter({ email: user.email });
    const profile = profiles?.[0];

    const prefsData = {};
    if (notify_badge_earned !== undefined) prefsData.notify_platform_news = notify_badge_earned;
    if (show_on_leaderboard !== undefined) prefsData.show_on_leaderboard = show_on_leaderboard;

    if (profile) {
      await base44.entities.CustomerProfile.update(profile.id, prefsData);
    } else {
      // Create a minimal profile with preferences
      await base44.entities.CustomerProfile.create({
        email: user.email,
        full_name: user.full_name || '',
        ...prefsData,
      });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error('updateConsumerPreferences error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});