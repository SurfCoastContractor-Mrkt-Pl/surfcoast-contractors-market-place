import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const BASE_URL = 'https://surfcoastcmp.com';

// Static public routes — ordered by priority
const STATIC_ROUTES = [
  { path: '/',                          priority: '1.0', changefreq: 'daily' },
  { path: '/About',                     priority: '0.9', changefreq: 'monthly' },
  { path: '/WhySurfCoast',             priority: '0.9', changefreq: 'monthly' },
  { path: '/Pricing',                   priority: '0.9', changefreq: 'weekly' },
  { path: '/wave-fo-about',            priority: '0.8', changefreq: 'monthly' },
  { path: '/BecomeContractor',         priority: '0.8', changefreq: 'monthly' },
  { path: '/CustomerSignup',           priority: '0.8', changefreq: 'monthly' },
  { path: '/ConsumerSignup',           priority: '0.7', changefreq: 'monthly' },
  { path: '/FindContractors',          priority: '0.8', changefreq: 'daily' },
  { path: '/Jobs',                      priority: '0.8', changefreq: 'daily' },
  { path: '/MarketDirectory',          priority: '0.8', changefreq: 'daily' },
  { path: '/BoothsAndVendorsMap',      priority: '0.7', changefreq: 'weekly' },
  { path: '/swap-meet-ratings',        priority: '0.6', changefreq: 'weekly' },
  { path: '/farmers-market-ratings',   priority: '0.6', changefreq: 'weekly' },
  { path: '/MarketShopSignup',         priority: '0.7', changefreq: 'monthly' },
  { path: '/QuoteRequestWizard',       priority: '0.7', changefreq: 'monthly' },
  { path: '/ComplianceGuide',          priority: '0.6', changefreq: 'monthly' },
  { path: '/wave-handbook',            priority: '0.6', changefreq: 'monthly' },
  { path: '/leaderboard',              priority: '0.5', changefreq: 'daily' },
  { path: '/trade-games',              priority: '0.5', changefreq: 'weekly' },
  { path: '/Blog',                      priority: '0.7', changefreq: 'weekly' },
  { path: '/Terms',                     priority: '0.4', changefreq: 'yearly' },
  { path: '/PrivacyPolicy',            priority: '0.4', changefreq: 'yearly' },
  // Trade SEO landing pages
  { path: '/contractors/plumbers',          priority: '0.8', changefreq: 'weekly' },
  { path: '/contractors/electricians',      priority: '0.8', changefreq: 'weekly' },
  { path: '/contractors/hvac-technicians',  priority: '0.8', changefreq: 'weekly' },
  { path: '/contractors/carpenters',        priority: '0.7', changefreq: 'weekly' },
  { path: '/contractors/painters',          priority: '0.7', changefreq: 'weekly' },
  { path: '/contractors/roofers',           priority: '0.7', changefreq: 'weekly' },
  { path: '/contractors/masons',            priority: '0.7', changefreq: 'weekly' },
  { path: '/contractors/landscapers',       priority: '0.7', changefreq: 'weekly' },
  { path: '/contractors/welders',           priority: '0.7', changefreq: 'weekly' },
  { path: '/contractors/tilers',            priority: '0.7', changefreq: 'weekly' },
  { path: '/contractors/general-contractors', priority: '0.8', changefreq: 'weekly' },
];

function urlEntry(loc, changefreq = 'monthly', priority = '0.5', lastmod = null) {
  const today = lastmod ?? new Date().toISOString().split('T')[0];
  return `  <url>
    <loc>${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const ROBOTS_TXT = `User-agent: *
Disallow: /admin
Disallow: /admin-control-hub
Disallow: /admin-error-logs
Disallow: /AdminWaveFo
Disallow: /adminfieldops
Disallow: /AdminDashboard
Disallow: /AdminPreview
Disallow: /Dashboard
Disallow: /ContractorAccount
Disallow: /ContractorBusinessHub
Disallow: /ContractorFinancialDashboard
Disallow: /ContractorBillingHistory
Disallow: /ContractorInquiries
Disallow: /ContractorVerificationDashboard
Disallow: /ContractorQuotesManagement
Disallow: /ContractorInventory
Disallow: /ContractorInventoryDashboard
Disallow: /ContractorServices
Disallow: /ContractorWorkloadHub
Disallow: /ContractorMyDay
Disallow: /contractor-inventory
Disallow: /contractor-inventory-management
Disallow: /contractor-services
Disallow: /job-pipeline
Disallow: /workload-hub
Disallow: /my-day
Disallow: /availability-manager
Disallow: /ai-scheduling-assistant
Disallow: /quickbooks-export
Disallow: /qb-sync-dashboard
Disallow: /job-expense-tracker
Disallow: /multi-option-proposals
Disallow: /CustomerAccount
Disallow: /CustomerSignup
Disallow: /CustomerPortal
Disallow: /customer-portal
Disallow: /ConsumerHub
Disallow: /Messaging
Disallow: /Messages
Disallow: /sms-hub
Disallow: /TimedChatSession
Disallow: /TimedChat
Disallow: /PaymentDemo
Disallow: /PaymentHistory
Disallow: /Success
Disallow: /Cancel
Disallow: /NotionHub
Disallow: /ProjectManagement
Disallow: /collaboration
Disallow: /FieldOps
Disallow: /WaveFo
Disallow: /FieldOpsReporting
Disallow: /WaveFoReporting
Disallow: /ResidentialWaveDashboard
Disallow: /platform-tests
Disallow: /github-dashboard
Disallow: /error-monitoring
Disallow: /database-management
Disallow: /system-health
Disallow: /advanced-analytics
Disallow: /api-usage-analytics
Disallow: /performance-analytics
Disallow: /alert-management
Disallow: /remediation
Disallow: /platform-activity
Disallow: /ActivityConsolidationDashboard
Disallow: /SearchAnalytics
Disallow: /SurfCoastPerformanceDashboard
Disallow: /SurfCoastReviewRequestsManager
Disallow: /game-analytics
Disallow: /location-rating-admin
Disallow: /market-shop-analytics
Disallow: /market-shop-inventory
Disallow: /MarketShopProfile
Disallow: /MarketShopBilling
Disallow: /AccountRecovery
Disallow: /AgentDemo
Disallow: /DisputeCenter
Disallow: /ReferralSignup
Disallow: /Referrals
Disallow: /review-consumer-order
Disallow: /wave-handbook
Disallow: /leaderboard
Disallow: /challenge/
Allow: /
Allow: /About
Allow: /WhySurfCoast
Allow: /why-surfcoast
Allow: /Pricing
Allow: /pricing
Allow: /wave-fo-about
Allow: /BecomeContractor
Allow: /FindContractors
Allow: /Jobs
Allow: /MarketDirectory
Allow: /BoothsAndVendorsMap
Allow: /vendor/
Allow: /contractor/
Allow: /contractors/
Allow: /swap-meet-ratings
Allow: /farmers-market-ratings
Allow: /MarketShopSignup
Allow: /QuoteRequestWizard
Allow: /ComplianceGuide
Allow: /trade-games
Allow: /Blog
Allow: /Terms
Allow: /PrivacyPolicy

Sitemap: https://surfcoastcmp.com/sitemap.xml`;

Deno.serve(async (req) => {
  const url = new URL(req.url);

  // Serve robots.txt if that path is requested
  if (url.pathname.endsWith('/robots.txt')) {
    return new Response(ROBOTS_TXT, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  }

  try {
    const base44 = createClientFromRequest(req);

    // Fetch dynamic entities in parallel
    const [contractors, vendors] = await Promise.all([
      base44.asServiceRole.entities.Contractor.list().catch(() => []),
      base44.asServiceRole.entities.MarketShop.list().catch(() => []),
    ]);

    const entries = [];

    // Static routes
    for (const route of STATIC_ROUTES) {
      entries.push(urlEntry(`${BASE_URL}${route.path}`, route.changefreq, route.priority));
    }

    // Dynamic: contractor public profiles — only complete, unlocked, non-demo profiles
    for (const contractor of contractors) {
      if (contractor.id && !contractor.is_demo && contractor.profile_complete && !contractor.account_locked) {
        entries.push(urlEntry(
          `${BASE_URL}/contractor/${contractor.id}`,
          'weekly',
          '0.7'
        ));
      }
    }

    // Dynamic: vendor/market shop detail pages
    for (const vendor of vendors) {
      if (vendor.id && !vendor.is_demo) {
        entries.push(urlEntry(
          `${BASE_URL}/vendor/${vendor.id}`,
          'weekly',
          '0.7'
        ));
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    return new Response(`Error generating sitemap: ${error.message}`, { status: 500 });
  }
});