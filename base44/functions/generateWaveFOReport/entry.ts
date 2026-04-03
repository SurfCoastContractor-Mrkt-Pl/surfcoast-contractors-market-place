import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';
import moment from 'npm:moment';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const { startDate, endDate, categorizeBy, format } = await req.json();

    // Validate dates
    if (!startDate || !endDate || !moment(startDate).isValid() || !moment(endDate).isValid()) {
      return Response.json({ error: 'Invalid start or end date' }, { status: 400 });
    }

    const scopes = await base44.asServiceRole.entities.ScopeOfWork.filter({
      status: 'closed'
    });

    // Filter by date range
    const filteredScopes = scopes.filter(scope => {
      const scopeDate = moment(scope.created_date);
      return scopeDate.isBetween(moment(startDate), moment(endDate), null, '[]');
    });

    let groupedData = {};
    let totalRevenue = 0;
    let totalPayout = 0;
    let totalJobs = 0;

    // Grouping logic
    if (categorizeBy === 'wave') {
      const WAVE_TIERS = {
        'Ripple': { min: 0, max: 15 },
        'Swell': { min: 16, max: 35 },
        'Breaker': { min: 36, max: 55 },
        'Pipeline': { min: 56, max: 75 },
        'Residential Wave': { min: 76, max: Infinity }
      };

      for (const scope of filteredScopes) {
        const contractor = await base44.asServiceRole.entities.Contractor.filter({
          email: scope.contractor_email
        });
        
        if (contractor && contractor.length > 0) {
          const contractorData = contractor[0];
          let contractorWave = 'Unknown';
          for (const tierName in WAVE_TIERS) {
            const tier = WAVE_TIERS[tierName];
            if ((contractorData.completed_jobs_count || 0) >= tier.min && (contractorData.completed_jobs_count || 0) <= tier.max) {
              contractorWave = tierName;
              break;
            }
          }

          if (!groupedData[contractorWave]) {
            groupedData[contractorWave] = {
              count: 0,
              revenue: 0,
              payout: 0,
              jobs: []
            };
          }
          groupedData[contractorWave].count++;
          groupedData[contractorWave].revenue += scope.cost_amount || 0;
          groupedData[contractorWave].payout += scope.contractor_payout_amount || (scope.cost_amount * 0.82) || 0;
          groupedData[contractorWave].jobs.push(scope);

          totalRevenue += scope.cost_amount || 0;
          totalPayout += scope.contractor_payout_amount || (scope.cost_amount * 0.82) || 0;
          totalJobs++;
        }
      }
    } else {
      // Default to customer categorization
      for (const scope of filteredScopes) {
        const customerKey = scope.client_name || scope.client_email || 'Unknown Customer';
        if (!groupedData[customerKey]) {
          groupedData[customerKey] = {
            count: 0,
            revenue: 0,
            payout: 0,
            jobs: []
          };
        }
        groupedData[customerKey].count++;
        groupedData[customerKey].revenue += scope.cost_amount || 0;
        groupedData[customerKey].payout += scope.contractor_payout_amount || (scope.cost_amount * 0.82) || 0;
        groupedData[customerKey].jobs.push(scope);

        totalRevenue += scope.cost_amount || 0;
        totalPayout += scope.contractor_payout_amount || (scope.cost_amount * 0.82) || 0;
        totalJobs++;
      }
    }

    const reportSummary = {
      totalJobs,
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      totalPayout: parseFloat(totalPayout.toFixed(2)),
      platformFeeEarned: parseFloat((totalRevenue - totalPayout).toFixed(2)),
      startDate: moment(startDate).format('YYYY-MM-DD'),
      endDate: moment(endDate).format('YYYY-MM-DD'),
      categorizeBy: categorizeBy || 'customer',
    };

    if (format === 'csv') {
      let csv = 'Category,Job Title,Client,Contractor,Status,Cost Amount,Payout Amount,Date\n';
      for (const category in groupedData) {
        for (const job of groupedData[category].jobs) {
          csv += `"${category}","${job.job_title}","${job.client_name}","${job.contractor_name}","${job.status}",${job.cost_amount},${job.contractor_payout_amount || (job.cost_amount * 0.82)},${moment(job.created_date).format('YYYY-MM-DD')}\n`;
        }
      }
      return new Response(csv, {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="wave-fo-report.csv"' },
      });
    }

    return Response.json({
      summary: reportSummary,
      grouped: groupedData,
      allJobs: filteredScopes,
    });

  } catch (error) {
    console.error('generateWaveFOReport error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});