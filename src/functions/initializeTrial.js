import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

/**
 * Initialize trial for new user signup
 * Checks if they're a founding member (<= 100) or standard trial user
 * Sets trial_started_at, trial_ends_at, trial_active flags
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { userEmail, userType } = body; // 'contractor' or 'customer'

    if (!userEmail || !userType) {
      return Response.json(
        { error: 'Missing userEmail or userType' },
        { status: 400 }
      );
    }

    // Get total signup count (cumulative)
    const entityName = userType === 'contractor' ? 'Contractor' : 'CustomerProfile';
    const allUsers = await base44.asServiceRole.entities[entityName].list();
    const totalSignupCount = allUsers.length; // This is the signup # for this new user

    const now = new Date().toISOString();
    const isFoundingMember = totalSignupCount <= 100;

    // Calculate trial end date
    const trialDays = isFoundingMember ? 365 : 14;
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + trialDays);

    // Update user record with trial info
    await base44.asServiceRole.entities[entityName].update(body.userId, {
      trial_started_at: now,
      trial_ends_at: trialEndDate.toISOString(),
      trial_active: true,
      trial_expired: false,
    });

    return Response.json({
      success: true,
      isFoundingMember,
      signupNumber: totalSignupCount,
      trialDays,
      trialEndDate: trialEndDate.toISOString(),
    });
  } catch (error) {
    console.error('initializeTrial error:', error.message);
    return Response.json(
      { error: 'Failed to initialize trial', details: error.message },
      { status: 500 }
    );
  }
});