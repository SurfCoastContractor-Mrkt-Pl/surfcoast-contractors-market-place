import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const results = {
      timestamp: new Date().toISOString(),
      analytics: {
        revenue: {},
        user_trends: {},
        completion_rates: {},
        churn_risk: {},
        growth_forecast: {},
      },
    };

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

    // Revenue trends (last 30 vs 60 days)
    try {
      const recentPayments = await base44.asServiceRole.entities.Payment.filter(
        { status: 'confirmed', created_date: { $gte: thirtyDaysAgo.toISOString() } },
        '-created_date',
        10000
      );
      const olderPayments = await base44.asServiceRole.entities.Payment.filter(
        {
          status: 'confirmed',
          created_date: { $gte: sixtyDaysAgo.toISOString(), $lt: thirtyDaysAgo.toISOString() }
        },
        '-created_date',
        10000
      );

      const recentRevenue = (recentPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const olderRevenue = (olderPayments || []).reduce((sum, p) => sum + (p.amount || 0), 0);
      const growth = olderRevenue > 0 ? ((recentRevenue - olderRevenue) / olderRevenue) * 100 : 0;

      results.analytics.revenue = {
        last_30_days: recentRevenue,
        previous_30_days: olderRevenue,
        growth_percent: Math.round(growth * 100) / 100,
        transaction_count_30d: (recentPayments || []).length,
      };
    } catch (e) {
      console.error('Revenue analytics error:', e);
    }

    // User growth trends
    try {
      const recentContractors = await base44.asServiceRole.entities.Contractor.filter(
        { created_date: { $gte: thirtyDaysAgo.toISOString() } },
        '-created_date',
        10000
      );
      const olderContractors = await base44.asServiceRole.entities.Contractor.filter(
        {
          created_date: { $gte: sixtyDaysAgo.toISOString(), $lt: thirtyDaysAgo.toISOString() }
        },
        '-created_date',
        10000
      );

      results.analytics.user_trends = {
        new_contractors_30d: (recentContractors || []).length,
        new_contractors_prev_30d: (olderContractors || []).length,
        verified_contractors: (
          await base44.asServiceRole.entities.Contractor.filter({ identity_verified: true }, '-created_date', 10000)
        )?.length || 0,
      };
    } catch (e) {
      console.error('User trends error:', e);
    }

    // Job completion rates
    try {
      const completedScopes = await base44.asServiceRole.entities.ScopeOfWork.filter(
        { status: 'closed', created_date: { $gte: thirtyDaysAgo.toISOString() } },
        '-created_date',
        10000
      );
      const allScopes = await base44.asServiceRole.entities.ScopeOfWork.filter(
        { created_date: { $gte: thirtyDaysAgo.toISOString() } },
        '-created_date',
        10000
      );

      const completionRate =
        allScopes && allScopes.length > 0 ? ((completedScopes?.length || 0) / allScopes.length) * 100 : 0;

      results.analytics.completion_rates = {
        completed_in_30d: completedScopes?.length || 0,
        total_started_in_30d: allScopes?.length || 0,
        completion_rate_percent: Math.round(completionRate * 100) / 100,
      };
    } catch (e) {
      console.error('Completion rate error:', e);
    }

    // Churn risk detection
    try {
      const activeContractors = await base44.asServiceRole.entities.Contractor.filter(
        { available: true },
        '-updated_date',
        10000
      );

      if (activeContractors && activeContractors.length > 0) {
        const thirtyDaysAgoTimestamp = thirtyDaysAgo.getTime();
        const churnRiskList = activeContractors
          .filter(c => {
            const lastUpdateTime = new Date(c.updated_date).getTime();
            return lastUpdateTime < thirtyDaysAgoTimestamp && c.completed_jobs_count > 5;
          })
          .map(c => ({
            contractor_id: c.id,
            name: c.name,
            last_active: c.updated_date,
            completed_jobs: c.completed_jobs_count,
            risk_score: 'high',
          }));

        results.analytics.churn_risk = {
          at_risk_count: churnRiskList.length,
          high_risk_contractors: churnRiskList.slice(0, 10),
        };
      }
    } catch (e) {
      console.error('Churn risk error:', e);
    }

    // Growth forecast (extrapolate trends)
    try {
      const monthlyPayments = await base44.asServiceRole.entities.Payment.filter(
        { status: 'confirmed', created_date: { $gte: sixtyDaysAgo.toISOString() } },
        '-created_date',
        10000
      );

      if (monthlyPayments && monthlyPayments.length > 0) {
        const thisMonthRevenue = (
          monthlyPayments.filter(p => p.created_date >= thirtyDaysAgo.toISOString()) || []
        ).reduce((sum, p) => sum + (p.amount || 0), 0);

        results.analytics.growth_forecast = {
          current_monthly_revenue: thisMonthRevenue,
          annualized_revenue: thisMonthRevenue * 12,
          forecast_next_month: Math.round(thisMonthRevenue * 1.05),
          forecast_confidence: 'medium',
        };
      }
    } catch (e) {
      console.error('Growth forecast error:', e);
    }

    console.log('Predictive analytics generated:', results);
    return Response.json(results);
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});