import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Step 1 of Escrow Flow:
 * Customer initiates payment. Stripe holds funds via PaymentIntent with manual capture.
 * Funds are NOT released to contractor until customer explicitly approves (Step 3).
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { scope_id, customer_name } = await req.json();

    if (!scope_id) {
      return Response.json({ error: 'scope_id required' }, { status: 400 });
    }

    // Fetch and validate the scope
    const scope = await base44.asServiceRole.entities.ScopeOfWork.get(scope_id);
    if (!scope) {
      return Response.json({ error: 'Scope of Work not found' }, { status: 404 });
    }

    // Only the customer for this scope can fund escrow
    if (scope.customer_email !== user.email) {
      return Response.json({ error: 'Forbidden: Only the customer for this scope can fund escrow' }, { status: 403 });
    }

    // Scope must be approved before escrow can be funded
    if (scope.status !== 'approved') {
      return Response.json({ error: `Scope must be approved before funding escrow. Current status: ${scope.status}` }, { status: 409 });
    }

    // Prevent duplicate escrow for same scope
    const existing = await base44.asServiceRole.entities.EscrowPayment.filter({ scope_id });
    const activeEscrow = existing?.find(e => !['cancelled', 'refunded'].includes(e.status));
    if (activeEscrow) {
      return Response.json({
        escrowId: activeEscrow.id,
        checkoutUrl: activeEscrow.stripe_checkout_url,
        status: activeEscrow.status,
        duplicate: true
      });
    }

    // Validate amount
    if (!scope.cost_amount || scope.cost_amount <= 0) {
      return Response.json({ error: 'Invalid scope cost amount' }, { status: 400 });
    }

    // Verify contractor exists and has Stripe Connect set up
    const contractors = await base44.asServiceRole.entities.Contractor.filter({ email: scope.contractor_email });
    const contractor = contractors?.[0];
    if (!contractor) {
      return Response.json({ error: 'Contractor not found' }, { status: 404 });
    }

    const platformFeePercentage = scope.platform_fee_percentage || 18;
    const amountCents = Math.round(scope.cost_amount * 100);
    const platformFeeCents = Math.round(amountCents * platformFeePercentage / 100);
    const contractorPayoutCents = amountCents - platformFeeCents;

    // Create escrow record (pending_payment)
    const escrow = await base44.asServiceRole.entities.EscrowPayment.create({
      scope_id,
      contractor_id: contractor.id,
      contractor_email: scope.contractor_email,
      contractor_name: scope.contractor_name,
      customer_email: user.email,
      customer_name: customer_name || scope.customer_name,
      job_title: scope.job_title,
      amount: scope.cost_amount,
      platform_fee_percentage: platformFeePercentage,
      platform_fee_amount: platformFeeCents / 100,
      contractor_payout_amount: contractorPayoutCents / 100,
      status: 'pending_payment',
    });

    const origin = req.headers.get('origin') || 'https://surfcoastmkt.com';

    // Create Stripe Checkout session — payment_intent_data.capture_method = 'manual'
    // This authorizes and holds the funds WITHOUT capturing (charging) until we explicitly capture
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `Escrow: ${scope.job_title}`,
              description: `Funds held in escrow until job completion is approved. Contractor: ${scope.contractor_name}`,
            },
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        capture_method: 'manual', // CRITICAL: holds funds, does not charge yet
        application_fee_amount: platformFeeCents,
        transfer_data: contractor.stripe_connected_account_id && contractor.stripe_account_charges_enabled
          ? { destination: contractor.stripe_connected_account_id }
          : undefined,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID'),
          escrow_id: escrow.id,
          scope_id,
          type: 'escrow',
        },
      },
      customer_email: user.email,
      success_url: `${origin}/Success?escrow_id=${escrow.id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/Cancel?escrow_id=${escrow.id}`,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        escrow_id: escrow.id,
        scope_id,
        type: 'escrow',
      },
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60, // 30 min to complete checkout
    });

    // Store session info on escrow record
    await base44.asServiceRole.entities.EscrowPayment.update(escrow.id, {
      stripe_checkout_session_id: session.id,
      stripe_checkout_url: session.url,
    });

    console.log(`Escrow checkout created: ${session.id} for scope ${scope_id}, amount $${scope.cost_amount}`);

    return Response.json({
      escrowId: escrow.id,
      checkoutUrl: session.url,
      sessionId: session.id,
      amount: scope.cost_amount,
    });

  } catch (error) {
    console.error('createEscrowCheckout error:', error.message);
    return Response.json({ error: 'Failed to create escrow checkout' }, { status: 500 });
  }
});