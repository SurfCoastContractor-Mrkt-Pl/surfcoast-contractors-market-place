import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { contractorEmail } = await req.json();

    if (!contractorEmail) {
      return Response.json(
        { error: 'Missing contractorEmail' },
        { status: 400 }
      );
    }

    if (user.role !== 'admin' && user.email !== contractorEmail) {
      return Response.json({ error: 'Forbidden: Cannot view analytics for another contractor' }, { status: 403 });
    }

    // Fetch all scopes for this contractor
    const scopes = await base44.entities.ScopeOfWork.filter({
      contractor_email: contractorEmail
    });

    // Calculate analytics
    const totalJobs = scopes.length;
    const completedJobs = scopes.filter(s => s.status === 'closed').length;
    
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentScopes = scopes.filter(s => new Date(s.created_date) > thirtyDaysAgo);
    const earningsThisMonth = recentScopes.reduce((sum, s) => sum + (s.contractor_payout_amount || 0), 0);

    // Job trends by day
    const jobsByDay = {};
    recentScopes.forEach(scope => {
      const date = new Date(scope.created_date).toLocaleDateString();
      jobsByDay[date] = (jobsByDay[date] || 0) + 1;
    });
    
    const jobTrends = Object.entries(jobsByDay).map(([date, count]) => ({
      date,
      jobs: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    // Status distribution
    const statusCounts = {};
    scopes.forEach(scope => {
      const status = scope.status || 'unknown';
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    
    const statusDistribution = Object.entries(statusCounts).map(([name, value]) => ({
      name: name.replace(/_/g, ' '),
      value
    }));

    // Busiest days of week
    const dayOfWeekCounts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    recentScopes.forEach(scope => {
      const day = new Date(scope.created_date).getDay();
      dayOfWeekCounts[day]++;
    });
    
    const topDays = Object.entries(dayOfWeekCounts).map(([day, count]) => ({
      dayOfWeek: dayNames[day],
      jobCount: count
    })).sort((a, b) => b.jobCount - a.jobCount).slice(0, 3);

    return Response.json({
      totalJobs,
      completedJobs,
      earningsThisMonth: Math.round(earningsThisMonth * 100) / 100,
      jobTrends,
      statusDistribution,
      topDays
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});