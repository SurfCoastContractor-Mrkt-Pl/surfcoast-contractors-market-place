import { differenceInDays } from 'date-fns';

export const TIME_PERIODS = {
  '7_days': { label: 'Last 7 days', days: 7 },
  '30_days': { label: 'Last 30 days', days: 30 },
  '90_days': { label: 'Last 90 days', days: 90 },
  'all_time': { label: 'All time', days: null }
};

export function getDateRange(period) {
  const now = new Date();
  const days = TIME_PERIODS[period]?.days;
  if (!days) return { start: null, end: now }; // all-time
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return { start, end: now };
}

export function isInDateRange(date, period) {
  const dateObj = new Date(date);
  const { start, end } = getDateRange(period);
  if (!start) return true; // all-time
  return dateObj >= start && dateObj <= end;
}

// CONTRACTOR METRICS
export function calculateContractorMetrics(scopes, reviews, period = 'all_time') {
  const scopesInPeriod = scopes.filter(s => isInDateRange(s.closed_date || s.created_date, period));
  const reviewsInPeriod = reviews.filter(r => isInDateRange(r.created_date, period));

  const completedScopes = scopesInPeriod.filter(s => s.status === 'closed');
  const activeScopes = scopes.filter(s => s.status === 'approved');

  // Performance metrics
  const completionRate = scopes.length > 0 ? Math.round((completedScopes.length / scopes.length) * 100) : 0;
  const avgResponseTime = calculateAvgResponseTime(scopes); // in hours
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1) : '—';

  // Revenue metrics
  const totalEarnings = completedScopes.reduce((sum, s) => sum + (s.contractor_payout_amount || 0), 0);
  const totalJobValue = completedScopes.reduce((sum, s) => sum + (s.cost_amount || 0), 0);
  const avgJobEarnings = completedScopes.length > 0 ? (totalEarnings / completedScopes.length).toFixed(2) : '0.00';

  // Customer metrics
  const uniqueCustomers = new Set(scopesInPeriod.map(s => s.customer_email)).size;
  const repeatCustomers = calculateRepeatCustomers(scopesInPeriod);

  return {
    performance: {
      completionRate,
      avgResponseTime: avgResponseTime ? `${avgResponseTime}h` : '—',
      avgRating,
      reviewCount: reviewsInPeriod.length
    },
    revenue: {
      totalEarnings: totalEarnings.toFixed(2),
      totalJobValue: totalJobValue.toFixed(2),
      avgJobEarnings,
      completedJobs: completedScopes.length,
      activeJobs: activeScopes.length
    },
    customers: {
      newCustomers: uniqueCustomers,
      repeatCustomers,
      totalReviews: reviewsInPeriod.length
    }
  };
}

function calculateAvgResponseTime(scopes) {
  const scopesWithDates = scopes.filter(s => s.created_date && s.agreed_work_date);
  if (scopesWithDates.length === 0) return null;
  
  const totalHours = scopesWithDates.reduce((sum, s) => {
    const created = new Date(s.created_date);
    const agreed = new Date(s.agreed_work_date);
    const hours = differenceInDays(agreed, created) * 24;
    return sum + hours;
  }, 0);
  
  return Math.round(totalHours / scopesWithDates.length);
}

function calculateRepeatCustomers(scopes) {
  const customerCounts = {};
  scopes.forEach(s => {
    customerCounts[s.customer_email] = (customerCounts[s.customer_email] || 0) + 1;
  });
  return Object.values(customerCounts).filter(count => count > 1).length;
}

// MARKET SHOP METRICS
export function calculateMarketShopMetrics(listings, reviews, orders, period = 'all_time') {
  const ordersInPeriod = orders.filter(o => isInDateRange(o.created_date, period));
  const reviewsInPeriod = reviews.filter(r => isInDateRange(r.created_date, period));

  // Revenue metrics
  const totalRevenue = ordersInPeriod.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = ordersInPeriod.length;
  const avgOrderValue = totalOrders > 0 ? (totalRevenue / totalOrders).toFixed(2) : '0.00';

  // Performance metrics
  const avgRating = reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / reviews.length).toFixed(1) : '—';
  const reviewCount = reviewsInPeriod.length;

  // Customer metrics
  const uniqueCustomers = new Set(ordersInPeriod.map(o => o.customer_email)).size;

  return {
    revenue: {
      totalRevenue: totalRevenue.toFixed(2),
      totalOrders,
      avgOrderValue
    },
    performance: {
      avgRating,
      reviewCount,
      listingCount: listings.length
    },
    customers: {
      uniqueCustomers,
      repeatRate: totalOrders > 0 ? Math.round((uniqueCustomers / totalOrders) * 100) : 0
    }
  };
}

// CUSTOMER METRICS
export function calculateCustomerMetrics(jobs, scopes, period = 'all_time') {
  const jobsInPeriod = jobs.filter(j => isInDateRange(j.created_date, period));
  const scopesInPeriod = scopes.filter(s => isInDateRange(s.created_date, period));
  
  const completedScopes = scopesInPeriod.filter(s => s.status === 'closed');
  const totalSpent = completedScopes.reduce((sum, s) => sum + (s.cost_amount || 0), 0);
  const avgProjectCost = completedScopes.length > 0 ? (totalSpent / completedScopes.length).toFixed(2) : '0.00';

  return {
    activity: {
      jobsPosted: jobsInPeriod.length,
      completedProjects: completedScopes.length,
      activeProjects: scopesInPeriod.filter(s => s.status === 'approved').length
    },
    spending: {
      totalSpent: totalSpent.toFixed(2),
      avgProjectCost,
      completedProjects: completedScopes.length
    }
  };
}