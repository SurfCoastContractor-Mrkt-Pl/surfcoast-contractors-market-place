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

Deno.serve(async (req) => {
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

    // Dynamic: contractor public profiles
    for (const contractor of contractors) {
      if (contractor.id && !contractor.is_demo) {
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