import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const { userEmail } = await req.json();

    if (!userEmail) {
      return Response.json({ error: 'userEmail required' }, { status: 400 });
    }

    // Check if user is authenticated, if so validate they can access this email
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (isAuthenticated) {
      const user = await base44.auth.me();
      if (user.role !== 'admin' && user.email.toLowerCase() !== userEmail.toLowerCase()) {
        return Response.json({ error: 'Forbidden: You can only access your own payment methods' }, { status: 403 });
      }
    }

    // Fetch saved payment methods from database
    const paymentMethods = await base44.entities.SavedPaymentMethod.filter({
      user_email: userEmail,
    });

    return Response.json(paymentMethods || []);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});