import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { otherUserEmail, otherUserType } = await req.json();

    if (!otherUserEmail || !otherUserType) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check user type matching (customer-to-contractor only)
    const userIsContractor = (await base44.entities.Contractor.filter({ email: user.email }))?.length > 0;
    const otherIsContractor = otherUserType === 'contractor';

    if (userIsContractor === otherIsContractor) {
      return Response.json({ 
        allowed: false, 
        reason: 'Can only message between customers and contractors' 
      });
    }

    // Check for valid, active payment/subscription
    // For customers: they are the payer. For contractors: the customer is the payer and contractor_email matches them.
    let payments;
    if (!userIsContractor) {
      // User is customer — look for payments they made to this contractor
      payments = await base44.asServiceRole.entities.Payment.filter({ 
        payer_email: user.email,
        contractor_email: otherUserEmail,
        status: { $in: ['confirmed', 'work_scheduled'] }
      });
    } else {
      // User is contractor — look for payments where this contractor is the recipient
      payments = await base44.asServiceRole.entities.Payment.filter({ 
        contractor_email: user.email,
        payer_email: otherUserEmail,
        status: { $in: ['confirmed', 'work_scheduled'] }
      });
    }

     if (!payments || payments.length === 0) {
       console.warn('No active payment found. User:', user.email, 'Other:', otherUserEmail);
       return Response.json({ 
         allowed: false, 
         reason: 'No active payment for this conversation',
         tier: null
       });
     }

    const latestPayment = payments.sort((a, b) => 
      new Date(b.confirmed_at) - new Date(a.confirmed_at)
    )[0];

    // Determine tier based on payment amount
    let tier = 'quote'; // Default tier for quote requests ($1.75)
    if (latestPayment.amount === 1.50) {
      tier = 'timed'; // 10-minute session
    } else if (latestPayment.amount === 50) {
      tier = 'subscription'; // Monthly subscription
    }

    // Check if contractor is trying to message about a job with an accepted scope
     if (userIsContractor && latestPayment.job_id) {
       const acceptedScopes = await base44.entities.ScopeOfWork.filter({
         job_id: latestPayment.job_id,
         status: 'approved',
         contractor_email: { $ne: user.email }
       });

       if (acceptedScopes && acceptedScopes.length > 0) {
         console.warn('Job already has accepted scope. Job:', latestPayment.job_id, 'Contractor:', user.email);
         return Response.json({ 
           allowed: false, 
           reason: 'This job has already been accepted by another contractor',
           tier
         });
       }
     }

    // For timed tier, check if session is still active
    if (tier === 'timed') {
      const sessionExpiry = new Date(latestPayment.session_expires_at);
      if (new Date() > sessionExpiry) {
        return Response.json({ 
          allowed: false, 
          reason: 'Your communication session has expired',
          tier: 'timed'
        });
      }
    }

    // For subscription tier, verify active subscription exists
    if (tier === 'subscription') {
      const subscription = await base44.asServiceRole.entities.Subscription.filter({
        user_email: user.email,
        status: 'active'
      });

      if (!subscription || subscription.length === 0) {
        console.warn('No active subscription found for tier validation. User:', user.email);
        return Response.json({ 
          allowed: false, 
          reason: 'No active subscription found',
          tier: 'subscription'
        });
      }
    }

    return Response.json({
      allowed: true,
      tier,
      paymentId: latestPayment.id,
      sessionExpiry: latestPayment.session_expires_at,
    });

  } catch (error) {
    console.error('Messaging eligibility validation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});