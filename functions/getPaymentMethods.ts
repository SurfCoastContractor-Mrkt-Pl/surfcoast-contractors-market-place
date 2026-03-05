import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    // Fetch saved payment methods from database
    const paymentMethods = await base44.asServiceRole.entities.SavedPaymentMethod.filter({
      user_email: userEmail,
    });

    return Response.json(paymentMethods || []);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});