import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { completed_jobs = 0, unique_customers = 0, contractor_email } = await req.json();

    if (!contractor_email) {
      return Response.json({ error: 'contractor_email required' }, { status: 400 });
    }

    // Simplified tier calculation
    let tier = 'standard';
    let badge = null;

    if (completed_jobs >= 100 && unique_customers >= 50) {
      tier = 'premium';
      badge = 'Established Pro';
    } else if (completed_jobs >= 50 && unique_customers >= 25) {
      tier = 'max';
      badge = 'Trusted Contractor';
    } else if (completed_jobs >= 25 && unique_customers >= 10) {
      tier = 'pro';
      badge = 'Growing Pro';
    } else if (completed_jobs >= 5) {
      tier = 'starter';
      badge = 'Rising Star';
    }

    return Response.json({
      contractor_email,
      tier,
      badge,
      completed_jobs,
      unique_customers,
      success: true
    }, { status: 200 });
  } catch (error) {
    console.error('Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});