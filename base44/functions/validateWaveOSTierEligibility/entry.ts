import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { contractor_email, completed_jobs = 0, has_verified_license = false } = await req.json();

    if (!contractor_email) {
      return Response.json({ error: 'contractor_email required' }, { status: 400 });
    }

    // WAVE OS Tier Eligibility Logic
    let eligible_tier = 'free'; // Default: free basic profile
    let next_tier_requirement = null;

    if (completed_jobs >= 100 && has_verified_license) {
      eligible_tier = 'premium';
      next_tier_requirement = null;
    } else if (completed_jobs >= 50) {
      eligible_tier = 'max';
      next_tier_requirement = { tier: 'premium', required_jobs: 100, requires_license: true };
    } else if (completed_jobs >= 6) {
      eligible_tier = 'pro';
      next_tier_requirement = { tier: 'max', required_jobs: 50 };
    } else if (completed_jobs >= 5) {
      eligible_tier = 'starter';
      next_tier_requirement = { tier: 'pro', required_jobs: 6 };
    }

    return Response.json({
      contractor_email,
      current_tier: eligible_tier,
      completed_jobs,
      has_verified_license,
      next_tier_requirement,
      tier_features: {
        free: ['Basic profile', 'Receive job requests', 'Basic reviews'],
        starter: ['Everything in Free', '5 active postings', 'Job dashboard', 'Quote management'],
        pro: ['Everything in Starter', 'Automated invoicing', 'Analytics', 'CRM'],
        max: ['Everything in Pro', 'GPS tracking', 'File sharing', 'Progress payments'],
        premium: ['Everything in Max', 'AI scheduling', 'HubSpot sync', 'Priority support', 'Unlimited messaging']
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});