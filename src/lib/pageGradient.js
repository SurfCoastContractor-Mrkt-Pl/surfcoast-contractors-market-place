/**
 * Continuous Page Gradient System
 * Each page occupies a segment of a grand color progression.
 * The gradient cycles: White → Cream → Gold → Peach → Blood Orange → Sky Blue → Ocean Blue → Deep Blue → White
 */

// The grand color stops for the full journey
const GRAND_GRADIENT = [
  '#FFFFFF', // White
  '#FFFDE7', // Cream Yellow
  '#FFF59D', // Soft Yellow
  '#FFE57F', // Yellow
  '#FFD54F', // Gold
  '#FFCC80', // Light Orange
  '#FFA07A', // Salmon / Light Blood Orange
  '#FF6B35', // Blood Orange
  '#E8A0BF', // Pinkish transition
  '#BAD7F2', // Light Sky Blue
  '#87CEEB', // Sky Blue
  '#5BA4CF', // Medium Blue
  '#2176CC', // Ocean Blue
  '#1A5276', // Deep Blue
  '#0D2A4A', // Dark Navy
  '#FFFFFF', // Loop back to White
];

// Ordered page list — defines the gradient journey across the full app
const PAGE_ORDER = [
  '/',                              // Home
  '/About',                         // About
  '/WhySurfCoast',                  // Why SurfCoast
  '/why-surfcoast',
  '/Pricing',                       // Pricing
  '/pricing',
  '/BecomeContractor',              // Become a Contractor (signup)
  '/ContractorAccount',             // Contractor Account
  '/ContractorBusinessHub',         // Contractor Business Hub
  '/ContractorFinancialDashboard',  // Financial Dashboard
  '/ContractorInquiries',           // Inquiries
  '/ContractorQuotesManagement',    // Quotes Management
  '/ContractorVerificationDashboard', // Verification
  '/contractor-services',           // Services
  '/contractor-inventory',          // Inventory Dashboard
  '/contractor-inventory-management',
  '/job-expense-tracker',           // Job Expenses
  '/job-pipeline',                  // Job Pipeline
  '/availability-manager',          // Availability
  '/ai-scheduling-assistant',       // AI Scheduling
  '/multi-option-proposals',        // Proposals
  '/ProjectManagement',             // Project Management
  '/collaboration',                 // Collaboration Hub
  '/quickbooks-export',             // QuickBooks
  '/qb-sync-dashboard',
  '/CustomerSignup',                // Customer Signup
  '/ConsumerSignup',                // Consumer Signup
  '/ConsumerHub',                   // Consumer Hub
  '/customer-portal',               // Customer Portal
  '/QuoteRequestWizard',            // Quote Request
  '/QuoteRequestSuccess',           // Quote Success
  '/review-consumer-order',         // Consumer Review
  '/MarketShopSignup',              // Market Shop Signup
  '/BoothsAndVendorsMap',           // Booths & Vendors Map
  '/farmers-market-ratings',        // Farmers Market Ratings
  '/swap-meet-ratings',             // Swap Meet Ratings
  '/location-rating-admin',         // Location Rating Admin
  '/market-shop-analytics',         // Market Shop Analytics
  '/market-shop-inventory',         // Market Shop Inventory
  '/ReferralSignup',                // Referral Signup
  '/TimedChatSession',              // Timed Chat
  '/trade-games',                   // Trade Games
  '/leaderboard',                   // Game Leaderboard
  '/ResidentialWaveDashboard',      // Residential Wave
  '/PaymentDemo',                   // Payment Demo
  '/WaveFo',                        // Wave FO
  '/FieldOps',
  '/WaveFoReporting',               // Wave FO Reporting
  '/FieldOpsReporting',
  '/NotionHub',                     // Notion Hub
  '/SearchAnalytics',               // Search Analytics
  '/ComplianceGuide',               // Compliance Guide
  '/ComplianceDashboard',           // Compliance Dashboard
  '/SurfCoastReviewRequestsManager',// Review Requests
  '/SurfCoastPerformanceDashboard', // Performance Dashboard
  '/ActivityConsolidationDashboard',// Activity Dashboard
  '/activity-audit',                // Activity Audit
  '/admin',                         // Admin
  '/admin-control-hub',             // Admin Control Hub
  '/AdminWaveFo',                   // Admin Wave FO
  '/advanced-analytics',            // Advanced Analytics
  '/alert-management',              // Alert Management
  '/api-usage-analytics',           // API Usage
  '/database-management',           // Database Management
  '/error-monitoring',              // Error Monitoring
  '/game-analytics',                // Game Analytics
  '/performance-analytics',         // Performance Analytics
  '/platform-activity',             // Platform Activity
  '/remediation',                   // Remediation
  '/system-health',                 // System Health
];

/**
 * Interpolates between two hex colors by a factor t (0–1)
 */
function lerpColor(hexA, hexB, t) {
  const parse = (hex) => {
    const h = hex.replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);
  return `rgb(${r},${g},${b})`;
}

/**
 * Samples the grand gradient at a normalized position (0–1)
 */
function sampleGradient(position) {
  const stops = GRAND_GRADIENT;
  const scaledPos = position * (stops.length - 1);
  const index = Math.floor(scaledPos);
  const t = scaledPos - index;
  const colorA = stops[Math.min(index, stops.length - 1)];
  const colorB = stops[Math.min(index + 1, stops.length - 1)];
  return lerpColor(colorA, colorB, t);
}

/**
 * Returns the background gradient CSS value for a given pathname.
 * Each page shows a gentle blend of its segment of the grand gradient.
 */
export function getPageGradient(pathname) {
  // Home page manages its own background — skip gradient injection to avoid conflict
  if (pathname === '/') return '';

  // Normalize path — strip trailing slash (except root)
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  // Find page index — check exact match or prefix match for dynamic routes
  let pageIndex = PAGE_ORDER.findIndex((p) => p === normalizedPath);

  // Fallback: partial match for dynamic segments like /contractor/:id
  if (pageIndex === -1) {
    if (normalizedPath.startsWith('/contractor/')) pageIndex = PAGE_ORDER.indexOf('/ContractorAccount');
    else if (normalizedPath.startsWith('/vendor/')) pageIndex = PAGE_ORDER.indexOf('/BoothsAndVendorsMap');
    else if (normalizedPath.startsWith('/challenge/')) pageIndex = PAGE_ORDER.indexOf('/trade-games');
  }

  const total = PAGE_ORDER.length;
  const index = pageIndex === -1 ? 0 : pageIndex;

  // Calculate the center position of this page in the grand gradient
  const centerPos = index / (total - 1);

  // Sample colors slightly before and after the center for a gentle page-specific gradient
  const spread = 0.025;
  const startPos = Math.max(0, centerPos - spread);
  const endPos = Math.min(1, centerPos + spread);

  const startColor = sampleGradient(startPos);
  const midColor = sampleGradient(centerPos);
  const endColor = sampleGradient(endPos);

  return `linear-gradient(160deg, ${startColor} 0%, ${midColor} 50%, ${endColor} 100%)`;
}