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

    // Create Stripe Identity verification session (document type = hosted URL flow)
    const appUrl = Deno.env.get('APP_URL') || 'https://surfcoastcmp.com';
    const returnUrl = `${appUrl}/ContractorBusinessHub?tab=profile&verified=1`;

    const verificationSession = await stripe.identity.verificationSessions.create({
      type: 'document',
      options: {
        document: {
          allowed_types: ['driving_license', 'passport', 'id_card'],
          require_live_capture: true,
          require_matching_selfie: true,
        }
      },
      metadata: {
        contractor_id: contractor.id,
        contractor_email: user.email,
        app_id: Deno.env.get('BASE44_APP_ID'),
        return_url: returnUrl,
      }
    });

    // The hosted verification URL — user is redirected here to complete verification
    const verificationUrl = verificationSession.url || 
      `https://verify.stripe.com/start#${verificationSession.client_secret}`;

    return Response.json({
      verification_url: verificationUrl,
      session_id: verificationSession.id
    });
    } catch (error) {
    console.error('Identity verification initialization error:', error?.message || error);
    return Response.json(
      { error: error?.message || 'Failed to initialize verification' },
      { status: 500 }
    );
    }
});