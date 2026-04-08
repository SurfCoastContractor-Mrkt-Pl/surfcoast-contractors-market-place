import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@16.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Require authenticated admin user
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { escrow_id } = await req.json();

    if (!escrow_id) {
      return Response.json({ error: 'escrow_id is required' }, { status: 400 });
    }

    // Fetch escrow payment
    const escrow = await base44.asServiceRole.entities.EscrowPayment.get(escrow_id);

    if (!escrow) {
      return Response.json({ error: 'Escrow payment not found' }, { status: 404 });
    }

    // Only release if funded and not already released
    if (escrow.status !== 'pending_release') {
      return Response.json({ 
        error: `Cannot release escrow in ${escrow.status} status. Only 'pending_release' can be released.` 
      }, { status: 400 });
    }

    // Check for idempotency: already released
    if (escrow.status === 'released' && escrow.stripe_transfer_id) {
      return Response.json({ 
        success: true, 
        message: 'Payout already released',
        transferId: escrow.stripe_transfer_id,
        amount: escrow.contractor_payout_amount
      });
    }

    // Fetch contractor to get Stripe Connect account
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: escrow.contractor_email
    });

    if (!contractors || contractors.length === 0) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const contractor = contractors[0];

    // Verify contractor has Stripe Connect account
    if (!contractor.stripe_connected_account_id) {
      return Response.json({ 
        error: 'Contractor has not set up Stripe Connect account for payouts' 
      }, { status: 400 });
    }

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey) {
      console.error('STRIPE_SECRET_KEY not configured');
      return Response.json({ error: 'Payment processing not configured' }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey);

    try {
      // Create transfer from platform account to contractor's connected account
      const amountInCents = Math.round(escrow.contractor_payout_amount * 100);

      const transfer = await stripe.transfers.create({
        amount: amountInCents,
        currency: 'usd',
        destination: contractor.stripe_connected_account_id,
        description: `Payout for job: ${escrow.job_title}`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          escrow_id: escrow_id,
          scope_id: escrow.scope_id,
        }
      });

      // Update escrow status to released
      await base44.asServiceRole.entities.EscrowPayment.update(escrow_id, {
        status: 'released',
        stripe_transfer_id: transfer.id,
        released_at: new Date().toISOString()
      });

      // Send email to contractor
      await base44.asServiceRole.integrations.Core.SendEmail({
        to: escrow.contractor_email,
        subject: `Payment Released - ${escrow.job_title}`,
        body: `Hello ${escrow.contractor_name},\n\nYour payment for "${escrow.job_title}" has been released to your Stripe Connect account.\n\nAmount: $${escrow.contractor_payout_amount.toFixed(2)}\nTransfer ID: ${transfer.id}\n\nThank you for your work!\n\nBest regards,\nSurfCoast`
      });

      console.log(`Escrow payout released: ${escrow_id}, Transfer ID: ${transfer.id}`);

      return Response.json({
        success: true,
        transferId: transfer.id,
        amount: escrow.contractor_payout_amount,
        message: 'Payout released successfully'
      });

    } catch (stripeError) {
      console.error('Stripe transfer error:', stripeError);
      return Response.json({ 
        error: `Stripe error: ${stripeError.message}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('releaseEscrowPayout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});