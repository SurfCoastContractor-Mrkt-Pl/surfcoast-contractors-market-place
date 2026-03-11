import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const secretKey = Deno.env.get('STRIPE_SECRET_KEY');
if (!secretKey || !secretKey.startsWith('sk_')) {
  throw new Error('Invalid STRIPE_SECRET_KEY: not configured or expired');
}
const stripeClient = new Stripe(secretKey);

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paymentMethodId } = await req.json();

    if (!paymentMethodId) {
      return Response.json({ error: 'paymentMethodId required' }, { status: 400 });
    }

    // Get the saved payment method record to get the Stripe ID
    const savedMethod = await base44.entities.SavedPaymentMethod.get(paymentMethodId);

    if (!savedMethod) {
      return Response.json({ error: 'Payment method not found' }, { status: 404 });
    }

    // Only allow the owner or admin to delete
    if (user.role !== 'admin' && savedMethod.user_email.toLowerCase() !== user.email.toLowerCase()) {
      return Response.json({ error: 'Forbidden: You can only delete your own payment methods' }, { status: 403 });
    }

    // Detach from Stripe
    await stripeClient.paymentMethods.detach(savedMethod.stripe_payment_method_id);

    // Delete from database
    await base44.entities.SavedPaymentMethod.delete(paymentMethodId);

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error deleting payment method');
    
    // Log to ErrorLog
    try {
      await base44.asServiceRole.functions.invoke('createStripeErrorLog', {
        error_type: 'payment',
        error_message: error.message || 'Delete payment method failed',
        user_email: user?.email || 'unknown',
        user_type: 'unknown',
        action: 'Delete payment method',
        severity: 'high',
        context: JSON.stringify({ paymentMethodId }),
      });
    } catch (logError) {
      console.error('Failed to log error');
    }

    return Response.json({ 
      error: 'Failed to delete payment method'
    }, { status: error.statusCode || 500 });
  }
});