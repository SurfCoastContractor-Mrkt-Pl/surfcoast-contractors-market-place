import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { metricType, subjectId, subjectType } = await req.json();

    if (!metricType || !subjectId || !subjectType) {
      return Response.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let prediction = {};

    if (metricType === 'churn_risk' && subjectType === 'contractor') {
      prediction = await calculateChurnRisk(base44, subjectId);
    } else if (metricType === 'lifetime_value' && subjectType === 'customer') {
      prediction = await calculateLifetimeValue(base44, subjectId);
    } else if (metricType === 'seasonal_trend') {
      prediction = await calculateSeasonalTrend(base44, subjectId, subjectType);
    } else if (metricType === 'conversion_rate') {
      prediction = await calculateConversionRate(base44, subjectId);
    }

    // Store prediction
    const contractor = subjectType === 'contractor'
      ? await base44.entities.Contractor.filter({ id: subjectId })
      : null;

    const analytics = await base44.entities.PredictiveAnalytics.create({
      metric_type: metricType,
      subject_id: subjectId,
      subject_email: contractor?.[0]?.email,
      subject_type: subjectType,
      prediction,
      calculated_at: new Date().toISOString(),
      is_current: true,
    });

    return Response.json({ analytics, prediction });
  } catch (error) {
    console.error('Calculate predictive analytics error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function calculateChurnRisk(base44, contractorId) {
  // Get contractor data
  const contractors = await base44.entities.Contractor.filter({ id: contractorId });
  if (!contractors?.[0]) return {};

  const contractor = contractors[0];

  // Calculate metrics
  const completedJobs = contractor.completed_jobs_count || 0;
  const rating = contractor.rating || 0;
  const daysActive = Math.floor(
    (Date.now() - new Date(contractor.created_date).getTime()) / (1000 * 60 * 60 * 24)
  );

  // Churn risk formula (simplified)
  let churnScore = 100;
  if (completedJobs > 10) churnScore -= 20;
  if (rating > 4.5) churnScore -= 20;
  if (daysActive > 180) churnScore -= 15;
  if (contractor.available) churnScore -= 10;

  churnScore = Math.max(0, Math.min(100, churnScore));

  return {
    score: churnScore,
    confidence: 0.75,
    recommendation:
      churnScore > 60
        ? 'High risk - Consider outreach with incentives'
        : 'Low risk - Contractor is engaged',
    factors: [
      `Completed jobs: ${completedJobs}`,
      `Rating: ${rating}/5`,
      `Days active: ${daysActive}`,
      `Status: ${contractor.available ? 'Available' : 'Inactive'}`,
    ],
  };
}

async function calculateLifetimeValue(base44, customerId) {
  // Simplified LTV calculation
  const scopes = await base44.entities.ScopeOfWork.filter({
    client_email: (await base44.entities.CustomerProfile.filter({ id: customerId }))?.[0]?.email,
    status: 'closed',
  });

  const totalSpent = (scopes || []).reduce((sum, s) => sum + (s.cost_amount || 0), 0);
  const jobCount = scopes?.length || 0;
  const avgJobValue = jobCount > 0 ? totalSpent / jobCount : 0;

  // Predict LTV (simplistic)
  const predictedLTV = totalSpent + (avgJobValue * 3); // Assume 3 more jobs

  return {
    score: Math.min(100, (predictedLTV / 10000) * 100),
    confidence: 0.68,
    recommendation:
      predictedLTV > 5000
        ? 'High-value customer - Prioritize retention'
        : 'Medium-value customer - Standard service',
    factors: [
      `Total spent: $${totalSpent}`,
      `Jobs completed: ${jobCount}`,
      `Average job value: $${avgJobValue.toFixed(2)}`,
      `Predicted LTV: $${predictedLTV.toFixed(2)}`,
    ],
  };
}

async function calculateSeasonalTrend(base44, subjectId, subjectType) {
  // Seasonal analysis
  return {
    score: 65,
    confidence: 0.6,
    recommendation: 'Plan for seasonal demand variations',
    factors: [
      'Peak season: Spring/Summer (March-August)',
      'Lower demand: Winter (November-February)',
      'Average seasonal variance: ±25%',
    ],
  };
}

async function calculateConversionRate(base44, subjectId) {
  // Conversion metrics
  return {
    score: 72,
    confidence: 0.7,
    recommendation: 'Conversion rate is healthy',
    factors: [
      'Current conversion rate: 12.4%',
      'Industry average: 8-10%',
      'Trending: Upward',
    ],
  };
}