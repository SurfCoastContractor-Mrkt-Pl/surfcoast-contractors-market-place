import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Initialize Stripe Identity verification session for contractors
 * Returns a client secret for frontend to complete verification
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor profile
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: user.email
    });
    const contractor = contractors[0];

    if (!contractor) {
      return Response.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    if (contractor.identity_verified) {
      return Response.json({
        already_verified: true,
        message: 'Identity already verified'
      });
    }

    // Create Stripe Identity verification session
    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'id_number',
      metadata: {
        contractor_id: contractor.id,
        contractor_email: user.email,
        app_id: Deno.env.get('BASE44_APP_ID')
      }
    });

    return Response.json({
      client_secret: verificationSession.client_secret,
      session_id: verificationSession.id
    });
    } catch (error) {
    console.error('Identity verification initialization error');
    return Response.json(
      { error: 'Failed to initialize verification' },
      { status: 500 }
    );
    }
});