import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const LOCATION_MATCH_KEYWORDS = {
  'california': ['ca', 'calif', 'los angeles', 'san francisco', 'san diego'],
  'texas': ['tx', 'texas', 'houston', 'dallas', 'austin'],
  'new york': ['ny', 'new york', 'nyc', 'brooklyn', 'manhattan'],
  'florida': ['fl', 'florida', 'miami', 'tampa', 'orlando'],
};

function locationMatch(jobLocation, contractorLocation) {
  if (!jobLocation || !contractorLocation) return 0;
  
  const jobLoc = jobLocation.toLowerCase();
  const contractorLoc = contractorLocation.toLowerCase();
  
  // Exact match
  if (jobLoc === contractorLoc) return 100;
  
  // One contains the other
  if (jobLoc.includes(contractorLoc) || contractorLoc.includes(jobLoc)) return 75;
  
  // Check state-level matches
  for (const [state, keywords] of Object.entries(LOCATION_MATCH_KEYWORDS)) {
    const jobMatches = keywords.some(k => jobLoc.includes(k));
    const contractorMatches = keywords.some(k => contractorLoc.includes(k));
    if (jobMatches && contractorMatches) return 50;
  }
  
  return 0;
}

function tradeMatch(jobTrade, contractorTrade, contractorLineOfWork) {
  if (!jobTrade) return 0;
  
  const jobT = jobTrade.toLowerCase();
  
  // Trade specialty exact match
  if (contractorTrade && contractorTrade.toLowerCase() === jobT) return 100;
  
  // Line of work contains the trade
  if (contractorLineOfWork) {
    const lineWork = contractorLineOfWork.toLowerCase();
    if (lineWork.includes(jobT.replace(/_/g, ' '))) return 75;
  }
  
  return 0;
}

function calculateMatchScore(job, contractor) {
  const locationScore = locationMatch(job.location, contractor.location);
  const tradeScore = tradeMatch(
    job.trade_needed,
    contractor.trade_specialty,
    contractor.line_of_work
  );
  
  // Weighted average: 60% trade match, 40% location
  return Math.round((tradeScore * 0.6) + (locationScore * 0.4));
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // For automations, we use service role. Verify the call is valid.
    // When called via automation, there's no user context, so we verify it's an internal call
    const internalKey = req.headers.get('x-internal-service-key');
    const expectedKey = Deno.env.get('INTERNAL_SERVICE_KEY');
    const isValidInternalCall = internalKey && internalKey === expectedKey;
    
    // Try to get user context for manual triggers
    let user = null;
    try {
      user = await base44.auth.me();
    } catch {
      // No user context (automation call)
    }
    
    // Only allow: internal service calls OR authenticated admin users
    if (!isValidInternalCall && (!user || user.role !== 'admin')) {
      return Response.json(
        { error: 'Forbidden: admin access or internal service key required' },
        { status: 403 }
      );
    }
    
    // Fetch all unnotified jobs (created in last 24 hours) with limit
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const jobs = await base44.asServiceRole.entities.Job.filter(
      { status: 'open' },
      '-created_date',
      100
    );
    
    // Fetch available contractors with limit (reduced from 500 to 200 for resource efficiency)
    const contractors = await base44.asServiceRole.entities.Contractor.filter(
      { available: true, identity_verified: true },
      '-rating',
      200
    );
    
    // Fetch existing notifications to avoid duplicates
    const existingNotifications = await base44.asServiceRole.entities.JobNotification.list('-created_date', 5000);
    const notifiedPairs = new Set(
      existingNotifications.map(n => `${n.job_id}:${n.contractor_id}`)
    );
    
    let notificationsSent = 0;
    const matchRecords = [];
    
    // Match jobs to contractors
    for (const job of jobs) {
      if (job.created_date < twentyFourHoursAgo) continue; // Only new jobs
      
      for (const contractor of contractors) {
        const pairKey = `${job.id}:${contractor.id}`;
        if (notifiedPairs.has(pairKey)) continue; // Already notified
        
        const matchScore = calculateMatchScore(job, contractor);
        
        // Only notify if match score is 40 or higher
        if (matchScore >= 40) {
          const matchReason = getMatchReason(job, contractor, matchScore);
          
          matchRecords.push({
            job_id: job.id,
            contractor_id: contractor.id,
            contractor_email: contractor.email,
            job_title: job.title,
            match_score: matchScore,
            match_reason: matchReason,
            notified_at: new Date().toISOString(),
          });
        }
      }
    }
    
    // Create notification records in bulk via service role
    if (matchRecords.length > 0) {
      try {
        await base44.asServiceRole.entities.JobNotification.bulkCreate(matchRecords);
      } catch (createError) {
        console.error('Failed to bulk create JobNotifications:', createError.message);
      }
    }
    
    // Send email notifications (batch them to avoid rate limits)
    for (const record of matchRecords) {
      try {
        await base44.asServiceRole.integrations.Core.SendEmail({
          to: record.contractor_email,
          from_name: 'SurfCoast Marketplace',
          subject: `New ${record.job_title} Project Match in Your Area`,
          body: `Hi,\n\nWe found a project that matches your expertise!\n\nProject: ${record.job_title}\nReason: ${record.match_reason}\n\nCheck it out and submit a quote if interested: ${getJobUrl()}\n\nBest,\nSurfCoast Marketplace`,
        });
        notificationsSent++;
      } catch (error) {
        console.error(`Failed to send email to ${record.contractor_email}:`, error);
      }
    }
    
    return Response.json({
      success: true,
      matchesFound: matchRecords.length,
      notificationsSent,
      message: `Processed ${jobs.length} jobs and ${contractors.length} contractors`,
    });
  } catch (error) {
    console.error('Job matching error:', error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
});

function getMatchReason(job, contractor, score) {
  const reasons = [];
  
  if (job.trade_needed && contractor.trade_specialty === job.trade_needed) {
    reasons.push(`${contractor.trade_specialty} specialty match`);
  }
  
  if (locationMatch(job.location, contractor.location) > 50) {
    reasons.push(`near your location (${contractor.location})`);
  }
  
  if (contractor.rating) {
    reasons.push(`highly-rated (${contractor.rating.toFixed(1)}★)`);
  }
  
  return reasons.join(', ') || 'good skill match';
}

function getJobUrl() {
  return 'https://surfcoastmkt.app/Jobs';
}