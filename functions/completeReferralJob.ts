import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { referralId } = body;

    if (!referralId) {
      return Response.json(
        { success: false, error: "Referral ID required" },
        { status: 400 }
      );
    }

    // Fetch referral and verify user owns it
    const referral = await base44.entities.Referral.filter({
      id: referralId
    });

    if (!referral || referral.length === 0) {
      return Response.json(
        { success: false, error: "Referral not found" },
        { status: 404 }
      );
    }

    const referralRecord = referral[0];

    // Only the referrer can complete the referral
    if (referralRecord.referrer_email !== user.email) {
      return Response.json(
        { success: false, error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Update referral status
    await base44.entities.Referral.update(referralId, {
      status: "completed",
      completed_at: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error("[completeReferralJob] Error:", error.message);
    return Response.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
});