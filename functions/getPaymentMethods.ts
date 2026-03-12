import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    // Require authentication
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (user.role !== 'admin' && user.email.toLowerCase() !== userEmail.toLowerCase()) {
      return Response.json({ error: 'Forbidden: You can only access your own payment methods' }, { status: 403 });
    }

    // Fetch saved payment methods from database
    const paymentMethods = await base44.entities.SavedPaymentMethod.filter({
      user_email: userEmail,
    });

    // Deduplicate by stripe_payment_method_id, keeping the earliest record
    const seen = new Set();
    const deduped = [];
    const duplicateIds = [];
    for (const method of (paymentMethods || [])) {
      if (seen.has(method.stripe_payment_method_id)) {
        duplicateIds.push(method.id);
      } else {
        seen.add(method.stripe_payment_method_id);
        deduped.push(method);
      }
    }

    // Clean up duplicates in the background
    if (duplicateIds.length > 0) {
      for (const id of duplicateIds) {
        base44.entities.SavedPaymentMethod.delete(id).catch(() => {});
      }
    }

    return Response.json(deduped);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});