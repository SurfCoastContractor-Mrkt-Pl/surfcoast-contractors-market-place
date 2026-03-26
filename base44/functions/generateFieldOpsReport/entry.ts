import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { startDate, endDate, categorizeBy, format } = body;

    if (!startDate || !endDate) {
      return Response.json({ error: 'Start and end dates are required' }, { status: 400 });
    }

    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start > end) {
      return Response.json({ error: 'Start date must be before end date' }, { status: 400 });
    }

    // Fetch closed scopes with limit to prevent timeout
    const scopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: user.email,
      status: 'closed',
      limit: 500
    });

    if (!scopes || scopes.length === 0) {
      return Response.json({
        metrics: {
          totalJobs: 0,
          totalEarnings: 0,
          averageJobTime: 0
        },
        details: [],
        csv: ''
      });
    }

    // Filter by date range
    end.setHours(23, 59, 59, 999);

    const filtered = scopes.filter(scope => {
      const closedDate = new Date(scope.closed_date || scope.updated_date);
      return closedDate >= start && closedDate <= end;
    });

    // Calculate metrics
    let totalEarnings = 0;
    let totalHours = 0;
    const jobDetails = [];

    filtered.forEach(scope => {
      const payout = scope.contractor_payout_amount || 0;
      totalEarnings += payout;

      // Calculate job duration in hours
      let jobHours = scope.estimated_hours || 0;
      if (!jobHours && scope.customer_signed_scope_at && scope.closed_date) {
        const start = new Date(scope.customer_signed_scope_at);
        const end = new Date(scope.closed_date);
        jobHours = (end - start) / (1000 * 60 * 60);
      }
      totalHours += jobHours;

      jobDetails.push({
        date: scope.closed_date || scope.updated_date,
        jobTitle: scope.job_title,
        customer: scope.customer_name,
        earnings: payout,
        hours: jobHours,
        costType: scope.cost_type,
        costAmount: scope.cost_amount
      });
    });

    const totalJobs = filtered.length;
    const averageJobTime = totalJobs > 0 ? (totalHours / totalJobs).toFixed(2) : 0;

    // Fetch contractor to get current wave tier (info only)
    const contractor = await base44.asServiceRole.entities.Contractor.filter({ email: user.email });
    const completedJobsCount = contractor?.[0]?.completed_jobs_count || 0;
    // Note: Wave tier shown is current tier, not historical tier at time of job completion

    // Categorize data
    let groupedData = {};
    if (categorizeBy === 'customer') {
      filtered.forEach(scope => {
        const customer = scope.customer_name || 'Unknown';
        if (!groupedData[customer]) {
          groupedData[customer] = {
            jobs: 0,
            earnings: 0,
            hours: 0
          };
        }
        groupedData[customer].jobs += 1;
        groupedData[customer].earnings += scope.contractor_payout_amount || 0;
        const hours = scope.estimated_hours || 0;
        groupedData[customer].hours += hours;
      });
    } else {
      // Categorize by wave using contractor's current tier progression
      const wave = getWaveTier(completedJobsCount);
      if (!groupedData[wave]) {
        groupedData[wave] = { jobs: 0, earnings: 0, hours: 0 };
      }
      filtered.forEach(scope => {
        groupedData[wave].jobs += 1;
        groupedData[wave].earnings += scope.contractor_payout_amount || 0;
        const hours = scope.estimated_hours || 0;
        groupedData[wave].hours += hours;
      });
    }

    // Generate CSV if requested
    let csv = '';
    if (format === 'csv') {
      csv = generateCSV(filtered, categorizeBy, groupedData);
    }

    return Response.json({
      metrics: {
        totalJobs,
        totalEarnings: totalEarnings.toFixed(2),
        averageJobTime
      },
      details: jobDetails.sort((a, b) => new Date(b.date) - new Date(a.date)),
      grouped: groupedData,
      csv
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function escapeCSV(str) {
  if (!str) return '""';
  if (typeof str !== 'string') return str;
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function getWaveTier(completedJobsCount) {
  if (completedJobsCount >= 100) return 'Residential Wave';
  if (completedJobsCount >= 75) return 'Pipeline';
  if (completedJobsCount >= 55) return 'Breaker';
  if (completedJobsCount >= 35) return 'Swell';
  return 'Ripple';
}

function generateCSV(scopes, categorizeBy, groupedData) {
  const lines = [];

  // Header
  lines.push('SurfCoast Waves FO - Job Report');
  lines.push(`Generated: ${new Date().toISOString().split('T')[0]}`);
  lines.push('');

  // Summary section
  lines.push('SUMMARY');
  lines.push(`Total Jobs Completed,${scopes.length}`);
  lines.push(`Total Earnings,$${scopes.reduce((sum, s) => sum + (s.contractor_payout_amount || 0), 0).toFixed(2)}`);
  lines.push('');

  // Grouped data section
  if (categorizeBy === 'customer') {
    lines.push('BREAKDOWN BY CUSTOMER');
    lines.push('Customer Name,Jobs Completed,Total Earnings,Avg Hours per Job');
    Object.entries(groupedData).forEach(([customer, data]) => {
      const avgHours = data.jobs > 0 ? (data.hours / data.jobs).toFixed(2) : 0;
      lines.push(`${escapeCSV(customer)},${data.jobs},$${data.earnings.toFixed(2)},${avgHours}`);
    });
  } else {
    lines.push('BREAKDOWN BY WAVE');
    lines.push('Wave Tier,Jobs Completed,Total Earnings,Avg Hours per Job');
    Object.entries(groupedData).forEach(([wave, data]) => {
      const avgHours = data.jobs > 0 ? (data.hours / data.jobs).toFixed(2) : 0;
      lines.push(`${escapeCSV(wave)},${data.jobs},$${data.earnings.toFixed(2)},${avgHours}`);
    });
  }

  lines.push('');

  // Detailed job list
  lines.push('DETAILED JOB LIST');
  lines.push('Date,Job Title,Customer,Earnings,Hours,Cost Type,Cost Amount');
  scopes.forEach(scope => {
    const date = scope.closed_date || scope.updated_date;
    const hours = scope.estimated_hours || 0;
    lines.push(`${date},${escapeCSV(scope.job_title)},${escapeCSV(scope.customer_name)},$${(scope.contractor_payout_amount || 0).toFixed(2)},${hours},${scope.cost_type},$${scope.cost_amount}`);
  });

  return lines.join('\n');
}