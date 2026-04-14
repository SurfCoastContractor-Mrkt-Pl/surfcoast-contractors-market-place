import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const [customers, contractors, payments, completedJobs] = await Promise.all([
      base44.asServiceRole.entities.CustomerProfile.list('-created_date', 1000),
      base44.asServiceRole.entities.Contractor.list('-created_date', 1000),
      base44.asServiceRole.entities.Payment.list('-created_date', 1000),
      base44.asServiceRole.entities.ScopeOfWork.filter({ status: 'closed' }, '-closed_date', 1000),
    ]);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newCustomersLast30 = customers.filter(c => c.created_date && new Date(c.created_date) > thirtyDaysAgo).length;
    const newContractorsLast30 = contractors.filter(c => c.created_date && new Date(c.created_date) > thirtyDaysAgo).length;
    const completedJobsLast30 = completedJobs.filter(j => j.closed_date && new Date(j.closed_date) > thirtyDaysAgo).length;
    const totalRevenue = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
    const revenueLastThirty = payments
      .filter(p => p.confirmed_at && new Date(p.confirmed_at) > thirtyDaysAgo)
      .reduce((sum, p) => sum + (p.amount || 0), 0);

    return Response.json({
      summary: {
        totalCustomers: customers.length,
        totalContractors: contractors.length,
        totalCompletedJobs: completedJobs.length,
        totalRevenue: totalRevenue.toFixed(2),
      },
      last30Days: {
        newCustomers: newCustomersLast30,
        newContractors: newContractorsLast30,
        completedJobs: completedJobsLast30,
        revenue: revenueLastThirty.toFixed(2),
      },
      recentData: {
        latestCustomers: customers.slice(0, 5),
        latestContractors: contractors.slice(0, 5),
        latestCompletedJobs: completedJobs.slice(0, 5),
      },
    });
  } catch (error) {
    console.error('getPlatformActivitySummary error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});