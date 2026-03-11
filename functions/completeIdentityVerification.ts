import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';
import Stripe from 'npm:stripe@17.5.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

/**
 * Complete identity verification by checking Stripe verification session status
 * Mark contractor as verified if successful
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await req.json();

    if (!sessionId) {
      return Response.json({ error: 'sessionId required' }, { status: 400 });
    }

    // Get contractor profile
    const contractors = await base44.asServiceRole.entities.Contractor.filter({
      email: user.email
    });
    const contractor = contractors[0];

    if (!contractor) {
      return Response.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    // Check verification session status
    const verificationSession = await stripe.identity.verificationSessions.retrieve(sessionId);

    if (!verificationSession) {
      return Response.json({ error: 'Verification session not found' }, { status: 404 });
    }

    console.log(`Verification session status: ${verificationSession.status} for ${user.email}`);

    // If verified, update contractor
    if (verificationSession.status === 'verified') {
      await base44.asServiceRole.entities.Contractor.update(contractor.id, {
        identity_verified: true
      });

      console.log(`Contractor ${contractor.id} marked as identity verified`);

      return Response.json({
        success: true,
        status: 'verified',
        message: 'Identity verification successful'
      });
    } else if (verificationSession.status === 'unverified') {
      return Response.json({
        success: false,
        status: 'unverified',
        message: 'Identity verification failed. Please try again.',
        details: verificationSession.last_error?.code || 'unknown_error'
      });
    } else if (verificationSession.status === 'processing') {
      return Response.json({
        success: false,
        status: 'processing',
        message: 'Identity verification is still being processed. Please wait.'
      });
    } else {
      return Response.json({
        success: false,
        status: verificationSession.status,
        message: 'Unexpected verification status'
      });
    }
  } catch (error) {
    console.error('Identity verification completion error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});