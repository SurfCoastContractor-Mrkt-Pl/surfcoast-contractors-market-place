import { createClientFromRequest } from 'npm:@base44/sdk@0.8.21';
import Stripe from 'npm:stripe@17.0.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get contractor
    const contractors = await base44.entities.Contractor.filter({ email: user.email });
    const contractor = contractors[0];

    if (!contractor) {
      return Response.json({ error: 'Contractor profile not found' }, { status: 404 });
    }

    // If already has connected account, return existing link
    if (contractor.stripe_connected_account_id) {
      const loginLink = await stripe.accounts.createLoginLink(contractor.stripe_connected_account_id);
      return Response.json({ loginLink: loginLink.url });
    }

    // Create new Stripe Connect account
    const account = await stripe.accounts.create({
      type: 'express',
      email: user.email,
      business_type: 'individual',
      individual: {
        first_name: contractor.name.split(' ')[0],
        last_name: contractor.name.split(' ').slice(1).join(' '),
        email: user.email,
        phone: contractor.phone,
        dob: {
          day: new Date(contractor.date_of_birth).getDate(),
          month: new Date(contractor.date_of_birth).getMonth() + 1,
          year: new Date(contractor.date_of_birth).getFullYear()
        },
        address: {
          country: 'US'
        }
      },
      metadata: {
        contractor_id: contractor.id,
        app_id: Deno.env.get('BASE44_APP_ID')
      }
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      type: 'account_onboarding',
      refresh_url: 'https://surfcoast.app/contractor-account?tab=fees',
      return_url: 'https://surfcoast.app/contractor-account?tab=fees&setup=complete'
    });

    // Save account ID to contractor
    await base44.entities.Contractor.update(contractor.id, {
      stripe_connected_account_id: account.id
    });

    return Response.json({ onboardingUrl: accountLink.url });
  } catch (error) {
    console.error('Error in createStripeConnectOnboarding');
    return Response.json({ error: 'Failed to create onboarding link' }, { status: 500 });
  }
});