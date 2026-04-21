import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

function initializeStripe() {
  const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY environment variable is not configured');
  }
  return new Stripe(secretKey);
}

Deno.serve(async (req) => {
  try {
    let stripeClient;
    try {
      stripeClient = initializeStripe();
    } catch (initErr) {
      console.error('Stripe initialization failed:', initErr.message);
      return Response.json({
        error: 'Payment service unavailable',
        code: 'SERVICE_UNAVAILABLE'
      }, { status: 503 });
    }

    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // Fetch all SavedPaymentMethod records
    const allMethods = await base44.asServiceRole.entities.SavedPaymentMethod.list();
    
    let deletedCount = 0;
    const issues = [];

    for (const method of allMethods) {
      try {
        // Get payment method from Stripe
        const paymentMethod = await stripeClient.paymentMethods.retrieve(method.stripe_payment_method_id);
        
        // Check if Stripe has phone data
        const stripePhone = paymentMethod.billing_details?.phone;
        
        if (!stripePhone) {
          // No phone in Stripe = payment method without phone verification
          await base44.asServiceRole.entities.SavedPaymentMethod.delete(method.id);
          deletedCount++;
          issues.push({
            id: method.id,
            user_email: method.user_email,
            reason: 'No phone data in Stripe'
          });
        }
      } catch (error) {
        console.error(`Error processing payment method ${method.id}`);
        // If Stripe payment method doesn't exist or is invalid, delete the record
        if (error.message?.includes('No such payment_method')) {
          await base44.asServiceRole.entities.SavedPaymentMethod.delete(method.id);
          deletedCount++;
          issues.push({
            id: method.id,
            user_email: method.user_email,
            reason: 'Stripe payment method not found or invalid'
          });
        }
      }
    }

    return Response.json({
      success: true,
      deletedCount,
      issues,
      message: `Cleanup complete: ${deletedCount} problematic payment methods removed`
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});