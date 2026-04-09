import React from 'react';

export const chapters22to29 = [
  {
    id: 22,
    title: 'Platform Identity & Branding',
    sections: [
      {
        id: '22.1',
        title: 'Official Names & Aliases',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">SurfCoast operates under several names that all refer to the same platform. Understanding these aliases is important for search, legal, and communication purposes.</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-4 py-2 text-left">Name</th>
                    <th className="border border-slate-300 px-4 py-2 text-left">Context Used</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-300 px-4 py-2 font-semibold">SurfCoast CMP</td><td className="border border-slate-300 px-4 py-2">Short form used in SEO, FAQs, and search marketing</td></tr>
                  <tr className="bg-slate-50"><td className="border border-slate-300 px-4 py-2 font-semibold">SurfCoast Contractors Marketplace</td><td className="border border-slate-300 px-4 py-2">Full legal/formal name used in Terms, Privacy Policy, and official documents</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 font-semibold">SurfCoast Marketplace</td><td className="border border-slate-300 px-4 py-2">Consumer-friendly name used in marketing and general reference</td></tr>
                  <tr className="bg-slate-50"><td className="border border-slate-300 px-4 py-2 font-semibold">SCMP</td><td className="border border-slate-300 px-4 py-2">Internal abbreviation used in the handbook and admin tools</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 font-semibold">surfcoastcmp.com</td><td className="border border-slate-300 px-4 py-2">Official domain — the only domain used for privacy, legal, and platform communications</td></tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>Privacy Contact:</strong> All CCPA/CPRA requests and privacy communications go to <strong>privacy@surfcoastcmp.com</strong> (updated April 9, 2026 from the legacy surfcoastmarketplace.com address).
            </div>
          </div>
        ),
      },
      {
        id: '22.2',
        title: 'Platform Facts & Founder',
        content: (
          <div className="space-y-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-slate-300">
                <tbody>
                  <tr><td className="border border-slate-300 px-4 py-2 font-semibold">Founded</td><td className="border border-slate-300 px-4 py-2">2026</td></tr>
                  <tr className="bg-slate-50"><td className="border border-slate-300 px-4 py-2 font-semibold">Headquarters</td><td className="border border-slate-300 px-4 py-2">Inland Empire, California</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 font-semibold">Service Area</td><td className="border border-slate-300 px-4 py-2">United States — Nationwide</td></tr>
                  <tr className="bg-slate-50"><td className="border border-slate-300 px-4 py-2 font-semibold">Worker Categories</td><td className="border border-slate-300 px-4 py-2">60+ categories supported</td></tr>
                  <tr><td className="border border-slate-300 px-4 py-2 font-semibold">Minimum Age</td><td className="border border-slate-300 px-4 py-2">13 years old (parental consent required under 18)</td></tr>
                </tbody>
              </table>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Founder</h4>
              <p className="text-slate-600"><strong>Hector A. Navarrete</strong> — C36 Licensed Plumber, owner of SurfCoast Plumbing. Received his C36 license in 2022. Built out of South San Diego. At 14 years old he was homeless; he worked his way up through the trades. Also holds a purple belt in Gracie Jiu-Jitsu. He built SurfCoast Contractors Marketplace because he experienced firsthand what it costs to compete on platforms that exploit independent workers.</p>
              <blockquote className="mt-3 border-l-4 border-amber-400 pl-4 italic text-slate-600">"Being a contractor is not a job title. It is a mindset." — Hector A. Navarrete</blockquote>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Mission Statement</h4>
              <p className="text-slate-600">To end the lead-fee model that exploits independent workers. SurfCoast exists so that everyday people with real skills can find real work. Your profile and listing are free. Communication starts at $1.50 per 10-minute session. You only pay a facilitation fee when work actually happens.</p>
            </div>
          </div>
        ),
      },
      {
        id: '22.3',
        title: 'Six Platform Differentiators',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The following six points distinguish SurfCoast from every other marketplace in the industry:</p>
            <ol className="list-decimal list-inside text-slate-600 space-y-3">
              <li>No lead fees. You pay $1.50 per 10-minute session or $50/month for unlimited messaging — not $15 to $120 per lead that may never answer the phone.</li>
              <li>No shared leads. When a client reaches out to you it is because they chose you specifically.</li>
              <li>A free Basic Dashboard for every worker on the platform regardless of whether they use WAVE OS.</li>
              <li>WAVE OS business tools unlock as you work — five completed jobs gets you started, one hundred unlocks the top tier.</li>
              <li>The Market Shop connects farmers market vendors, flea market sellers, and swap meet operators with buyers — no other platform does this alongside a contractor marketplace.</li>
              <li>This platform was built by someone who did the work himself, not by investors looking for a return.</li>
            </ol>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              <strong>vs. Angi/HomeAdvisor:</strong> Those platforms charge $15–$120 per lead regardless of outcome, send the same lead to 6–8 contractors simultaneously, and the FTC fined HomeAdvisor $7.2 million for deceptive marketing. SurfCoast charges nothing upfront and takes 18% only on completed, paid work.
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 23,
    title: 'Home Page – Public Platform Overview',
    sections: [
      {
        id: '23.1',
        title: 'Home Page Structure & Sections',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The Home page (<code className="bg-slate-100 px-1 rounded">/</code>) is the primary public-facing landing page. It is structured as a single scrolling page with the following sections:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>Ticker Bar:</strong> A dark top strip showing live Founding 100 spots remaining count (pulled from the database in real time) and the "California · Nationwide" tagline.</li>
              <li><strong>Hero Section:</strong> Main headline "Built for the worker. Not the algorithm." with platform description, four CTA buttons (Post a Job, What is WAVE OS?, Join as Entrepreneur, Market Shop), and a fee summary bar showing $0 profile, 5% vendor fee, 18% entrepreneur fee.</li>
              <li><strong>Platform Map Card:</strong> A code-styled card showing the two sides of the platform — Marketplace (Service Side + Market Shop) and WAVE OS (standalone software brand). Shows the "Logic gate: consumers cannot access service side" rule.</li>
              <li><strong>Tabbed Platform Overview:</strong> Three tabs — "Who It's For" (four user roles), "How Fees Work" (full fee table for entrepreneurs and clients), and "Multi-Trade Jobs" (how clients can hire multiple contractors for a single project).</li>
              <li><strong>Integrity & Compliance Section:</strong> Explains the two automated compliance triggers: 72-Hour Photo Rule and Mandatory Mutual Ratings. A hold blocks ALL platform activity.</li>
              <li><strong>Launch Engine Section:</strong> Three mechanics — Founding 100 (1 year free), 14-Day Standard Trial, and the 5:1 Referral Loop (stackable during trial window only).</li>
              <li><strong>FAQ Section:</strong> Nine schema-marked FAQ entries covering how contractors find work, comparisons to Angi/HomeAdvisor, what SurfCoast CMP is, the founder, WAVE OS, pricing, the Swap Meet, and licensing requirements. All FAQs use structured data markup for Google AEO/SGE indexing.</li>
              <li><strong>CTA Bar:</strong> Dark banner — "Ready to run your business on WAVE OS?" with a Join the Founding 100 button.</li>
            </ul>
          </div>
        ),
      },
      {
        id: '23.2',
        title: 'The Four User Roles (Home Page)',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The Home page's "Who It's For" tab clearly defines the four roles on the platform. Each role has distinct access and pricing:</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse border border-slate-300">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-300 px-3 py-2 text-left">Role</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Side</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Description</th>
                    <th className="border border-slate-300 px-3 py-2 text-left">Key Fees</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border border-slate-300 px-3 py-2 font-semibold">The Hirer (Client)</td><td className="border border-slate-300 px-3 py-2">Service Side</td><td className="border border-slate-300 px-3 py-2">Posts jobs free. Sends RFPs for $1.75. Pays $1.50/session for messaging.</td><td className="border border-slate-300 px-3 py-2">$0 post, $1.75 RFP, $1.50/session</td></tr>
                  <tr className="bg-slate-50"><td className="border border-slate-300 px-3 py-2 font-semibold">The Worker (Entrepreneur)</td><td className="border border-slate-300 px-3 py-2">Service Side</td><td className="border border-slate-300 px-3 py-2">Responds to leads free. Pays 18% only on job close. WAVE OS optional.</td><td className="border border-slate-300 px-3 py-2">$0 respond, 18% on close</td></tr>
                  <tr><td className="border border-slate-300 px-3 py-2 font-semibold">The Seller (Vendor)</td><td className="border border-slate-300 px-3 py-2">Market Shop</td><td className="border border-slate-300 px-3 py-2">Farmers market / swap meet booth holder. WAVEshop OS optional at $35/mo.</td><td className="border border-slate-300 px-3 py-2">$0 in-person, 5% online or $20/mo flat</td></tr>
                  <tr className="bg-slate-50"><td className="border border-slate-300 px-3 py-2 font-semibold">The Shopper (Consumer)</td><td className="border border-slate-300 px-3 py-2">Market Shop ONLY</td><td className="border border-slate-300 px-3 py-2">Browses and buys from local vendors. No access to service side at all.</td><td className="border border-slate-300 px-3 py-2">Pay at checkout per item</td></tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>Logic Gate:</strong> Consumer accounts are completely scoped to Market Shop only — they cannot browse contractors, post service jobs, or access any part of the service side. This separation is enforced at the application level via the ConsumerModeContext.
            </div>
          </div>
        ),
      },
      {
        id: '23.3',
        title: 'Multi-Trade Job Posting',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">SurfCoast supports multi-trade job postings — a client can post a single large project and hire multiple trade specialists independently under the same job listing.</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Each trade slot (e.g., Plumber, Electrician, Painter, Carpenter) can be filled by a different entrepreneur.</li>
              <li>Slots close once a contractor is hired — no double-booking.</li>
              <li>Open slots remain visible and searchable by trade category.</li>
              <li>The client manages all slots from their job posting dashboard.</li>
              <li>Each hired entrepreneur gets their own independent Scope of Work for their portion of the project.</li>
            </ul>
            <p className="text-slate-600 text-sm">Example: A kitchen renovation at $18,000 budget, 6-week timeline can fill a Plumber slot, an Electrician slot, and keep Painter and Carpenter slots open simultaneously.</p>
          </div>
        ),
      },
    ],
  },
  {
    id: 24,
    title: 'Entrepreneur Onboarding – 5-Step Registration',
    sections: [
      {
        id: '24.1',
        title: 'Onboarding Overview',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The BecomeContractor page (<code className="bg-slate-100 px-1 rounded">/BecomeContractor</code>) is the full entrepreneur registration flow. It is a 5-step wizard with progress tracking, auto-save to localStorage, and field-level validation. Login is required before submitting — the page redirects to login if unauthenticated.</p>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>Admin Preview Mode:</strong> Admins can append <code className="bg-white px-1 rounded">?preview=true</code> to the URL to see the full form without submitting data.
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Pre-Form Content on the Page</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>WAVE OS unlock table (jobs required per tier)</li>
                <li>Comparison table: SurfCoast CMP vs Angi/HomeAdvisor vs ServiceTitan</li>
                <li>5 FAQs covering costs, lead fees, Basic Dashboard, and licensing</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">5 Steps</h4>
              <ol className="list-decimal list-inside text-slate-600 space-y-1">
                <li>Basic Info (name, DOB, location)</li>
                <li>Professional Details (line of work, rate, bio, AI generator, tool suggestion)</li>
                <li>Identity Verification (ID photo + face photo)</li>
                <li>Credentials & Parental Consent (documents or minor consent docs)</li>
                <li>Policies (compliance acknowledgment + submission)</li>
              </ol>
            </div>
          </div>
        ),
      },
      {
        id: '24.2',
        title: 'Steps 1–3 Detail',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 1 – Basic Info</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li><strong>Age Gate:</strong> Must be at least 13. Under-13 rejected with field error.</li>
                <li><strong>Minor Flag:</strong> If under 18, sets is_minor: true and activates parental consent docs on Step 4.</li>
                <li><strong>GPS Location Detection:</strong> Button uses GPS + reverse geocode (Google Maps API) to auto-fill City/Region.</li>
                <li><strong>Auto-Save:</strong> All data continuously saved to localStorage key <code className="bg-slate-100 px-1 rounded">contractor_onboarding_data</code> — resuming after page refresh restores all data.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 2 – Professional Details</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>60+ categories: trades, freelancers, creatives, consultants, pet care, tutors, and more.</li>
                <li>Rate type: Hourly (enter rate) or Fixed (enter amount + description of what it covers).</li>
                <li><strong>AI Profile Generator:</strong> Generates a professional bio based on entered profession data.</li>
                <li><strong>Tool Suggestion Box:</strong> Optional. AI-processed suggestion toward the 100-mention threshold system.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 3 – Identity Verification</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Government-issued ID or Driver's License upload (required).</li>
                <li>Clear unobstructed face photo upload (required).</li>
                <li>Documents are stored privately — not on public profile. Admin-review only.</li>
                <li>identity_verified starts as false; set to true by admin after review.</li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: '24.3',
        title: 'Steps 4–5 & Post-Submission Flow',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 4 – Credentials & Parental Consent</h4>
              <p className="text-slate-600"><strong>Adults (18+):</strong> Optional credential uploads — certificates, degrees, diplomas, contractor licenses, trade licenses. Each includes type, label, legal name, and sole proprietor confirmation.</p>
              <p className="text-slate-600 mt-2"><strong>Minors (13–17):</strong> Seven required parental consent documents: child selfie, child ID, parental consent form, parent ID, proof of relationship, child proof of residence, parent proof of residence. Plus parent contact info. Weekly hour limit: 20 hrs/week. Account auto-locks if limit is reached until week resets.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Step 5 – Policies & Submission</h4>
              <p className="text-slate-600">Compliance acknowledgment checkbox required. On submit:</p>
              <ol className="list-decimal list-inside text-slate-600 space-y-1 mt-2">
                <li>Contractor record created in database.</li>
                <li>Analytics event <code className="bg-slate-100 px-1 rounded">contractor_profile_created</code> fired.</li>
                <li>Compliance Acknowledgment screen shown for review and signing.</li>
                <li>Stripe Connect Onboarding screen shown to link bank account for payouts.</li>
                <li>User redirected to Entrepreneur Portal (<code className="bg-slate-100 px-1 rounded">/ContractorAccount</code>).</li>
              </ol>
            </div>
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              <strong>Duplicate Check:</strong> The system checks if a Contractor record already exists for the authenticated user's email before creating. Duplicate found → error shown, no new record created.
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 25,
    title: 'Role Choice & Public Signup Paths',
    sections: [
      {
        id: '25.1',
        title: 'RoleChoice Page & Routing',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The RoleChoice page (<code className="bg-slate-100 px-1 rounded">/RoleChoice</code>) is the gateway shown when a user accesses the Unified Dashboard without a profile. It presents the four account type options and routes users to the correct signup flow.</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>Entrepreneur:</strong> → <code className="bg-slate-100 px-1 rounded">/BecomeContractor</code> — 5-step onboarding wizard.</li>
              <li><strong>Client (Hirer):</strong> → <code className="bg-slate-100 px-1 rounded">/CustomerSignup</code> — creates a CustomerProfile record.</li>
              <li><strong>Market Shop Vendor:</strong> → <code className="bg-slate-100 px-1 rounded">/MarketShopSignup</code> — creates a MarketShop profile and configures payment model.</li>
              <li><strong>Consumer (Shopper):</strong> → <code className="bg-slate-100 px-1 rounded">/ConsumerSignup</code> — creates a consumer-only account scoped to Market Shop browsing.</li>
            </ul>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              Users can hold multiple profile types simultaneously. A user who completed entrepreneur onboarding can still complete CustomerSignup or MarketShopSignup to add additional profile types.
            </div>
          </div>
        ),
      },
      {
        id: '25.2',
        title: 'Customer & Market Shop Signup',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Customer Signup (<code className="bg-slate-100 px-1 rounded">/CustomerSignup</code>)</h4>
              <p className="text-slate-600">Creates a CustomerProfile. Required: email, full name. Optional: phone, photo, DOB (must be 18+), location, property type (Residential House/Apartment/Condo, Commercial, Industrial, Land/Vacant), property address, preferred contractor types, preferred trades, bio. Notification preferences: job updates, messages, payment receipts, platform news.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Market Shop Signup (<code className="bg-slate-100 px-1 rounded">/MarketShopSignup</code>)</h4>
              <p className="text-slate-600">Creates a MarketShop entity. Required: shop name, contact email. Optional: description, location, categories, social links, logo.</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                <li><strong>Payment Model:</strong> 5% per online sale OR $20/month flat (waives fee). In-person sales always 0%.</li>
                <li><strong>Stripe Connect:</strong> Must link bank account to receive payouts from online sales.</li>
                <li><strong>WAVEshop OS:</strong> Optional $35/month upgrade — advanced inventory, analytics, marketing, custom branding, up to 50 gallery images.</li>
              </ul>
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 26,
    title: 'WhySurfCoast & Pricing Pages',
    sections: [
      {
        id: '26.1',
        title: 'WhySurfCoast Page',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The WhySurfCoast page (<code className="bg-slate-100 px-1 rounded">/WhySurfCoast</code> or <code className="bg-slate-100 px-1 rounded">/why-surfcoast</code>) explains the platform philosophy, business model, and reasoning behind every fee and policy.</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>Toll Road Model:</strong> You only pay when you use the road (i.e., when work is completed). Not a subscription trap or lead-fee extractor.</li>
              <li><strong>Fee Philosophy:</strong> Every fee is a filter. The $1.50 session fee keeps inquiries serious. The 18% facilitation fee only triggers on successful completed work — zero fees for failed conversations.</li>
              <li><strong>Compliance Systems:</strong> The 72-hour photo rule, mutual ratings requirement, and overdue job lock are explained as protective, not punitive — they protect both the client and the contractor.</li>
              <li><strong>WAVE OS Philosophy:</strong> WAVE OS is optional business infrastructure — you can operate on SurfCoast without it, but the tools are designed to help serious operators grow faster.</li>
            </ul>
          </div>
        ),
      },
      {
        id: '26.2',
        title: 'Pricing Page Complete Reference',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The Pricing page (<code className="bg-slate-100 px-1 rounded">/Pricing</code> or <code className="bg-slate-100 px-1 rounded">/pricing</code>) is the canonical source for all platform pricing as of April 9, 2026:</p>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Free Profile (Always Free — No Card)</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Public listing and discovery</li>
                <li>Receive job requests from clients</li>
                <li>Basic inquiry responses</li>
                <li>Reviews and ratings</li>
                <li>Mobile access</li>
                <li>Basic Dashboard (job management essentials)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">WAVE OS Tiers</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse border border-slate-300">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="border border-slate-300 px-3 py-2 text-left">Tier</th>
                      <th className="border border-slate-300 px-3 py-2 text-left">Price</th>
                      <th className="border border-slate-300 px-3 py-2 text-left">Unlock Requirement</th>
                      <th className="border border-slate-300 px-3 py-2 text-left">Messaging</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr><td className="border border-slate-300 px-3 py-2 font-semibold">WAVE Starter</td><td className="border border-slate-300 px-3 py-2">$19/mo</td><td className="border border-slate-300 px-3 py-2">5 completed jobs</td><td className="border border-slate-300 px-3 py-2">$1.50/session or $50/mo</td></tr>
                    <tr className="bg-slate-50"><td className="border border-slate-300 px-3 py-2 font-semibold">WAVE Pro</td><td className="border border-slate-300 px-3 py-2">$39/mo</td><td className="border border-slate-300 px-3 py-2">6–49 completed jobs</td><td className="border border-slate-300 px-3 py-2">$1.50/session or $50/mo</td></tr>
                    <tr><td className="border border-slate-300 px-3 py-2 font-semibold">WAVE Max</td><td className="border border-slate-300 px-3 py-2">$59/mo</td><td className="border border-slate-300 px-3 py-2">50–99 completed jobs</td><td className="border border-slate-300 px-3 py-2">Free with past clients only</td></tr>
                    <tr className="bg-slate-50"><td className="border border-slate-300 px-3 py-2 font-semibold">WAVE Premium</td><td className="border border-slate-300 px-3 py-2">$100/mo</td><td className="border border-slate-300 px-3 py-2">100+ jobs + verified license</td><td className="border border-slate-300 px-3 py-2">Free with ALL clients</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Vendor / Market Shop Pricing</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>Free public booth/space profile — no subscription required</li>
                <li>$20/month flat — waives the 5% online sale fee entirely</li>
                <li>5% per online sale (alternative pay-as-you-go model)</li>
                <li>WAVEshop OS: $35/month (advanced vendor tools add-on)</li>
                <li>In-person sales: always 0% fee</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Communication Pricing (All Users)</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li>$1.50 per 10-minute timed session (opens 60-minute window)</li>
                <li>$50/month unlimited messaging plan</li>
                <li>$1.75 per RFP (client sends detailed proposal request to specific contractor)</li>
                <li>Responding to RFPs is always free for contractors</li>
              </ul>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              <strong>Discontinued:</strong> The Residential Bundle ($125/month) has been discontinued. Residential invoicing, document templates, and lead management are now included in <strong>WAVE Premium</strong> ($100/month). The Stripe product still exists in the catalog but is no longer offered to new subscribers.
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 27,
    title: 'Messaging System – Deep Dive',
    sections: [
      {
        id: '27.1',
        title: 'Timed Chat Sessions',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The timed chat system is the primary pay-per-use communication method. A session costs $1.50 and opens a 60-minute communication window between a client and a specific contractor.</p>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">How It Works</h4>
              <ol className="list-decimal list-inside text-slate-600 space-y-2">
                <li>Client finds a contractor and initiates a session — pays $1.50 via saved card or Stripe checkout.</li>
                <li>A TimedChatSession record is created with a 60-minute expiry timestamp.</li>
                <li>Both parties can message freely during the active window.</li>
                <li>Session status: pending → confirmed → active → expired or work_scheduled.</li>
                <li>If a Scope of Work is created and approved during/after the session, status becomes "work_scheduled."</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Session Tiers</h4>
              <ul className="list-disc list-inside text-slate-600 space-y-1">
                <li><strong>Starter / Pro entrepreneurs:</strong> Pay $1.50/session or $50/mo unlimited for all clients.</li>
                <li><strong>WAVE Max entrepreneurs:</strong> Free sessions with past clients only (clients from previously closed jobs).</li>
                <li><strong>WAVE Premium entrepreneurs:</strong> Free sessions with all clients — no per-session fees.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Live Sessions Tab</h4>
              <p className="text-slate-600">Contractors see all active sessions from the <strong>Live Sessions</strong> tab in Business Hub → Jobs & Projects. A green badge indicates currently open sessions. The TimedChatSession page (<code className="bg-slate-100 px-1 rounded">/TimedChatSession</code>) shows the chat interface, countdown timer, and session status.</p>
            </div>
          </div>
        ),
      },
      {
        id: '27.2',
        title: 'Marketplace Messages & Project Messages',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Marketplace Messages (<code className="bg-slate-100 px-1 rounded">/Messaging</code>)</h4>
              <p className="text-slate-600">The general messaging system handles all non-timed communication — post-job messages, admin notifications, and inter-platform messages. Accessible from the navigation bar.</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                <li>All messages grouped by sender in a unified inbox.</li>
                <li>Threaded conversations via parent_message_id.</li>
                <li>File attachments supported: documents, images, other. Each attachment stores URL, original filename, and type.</li>
                <li>Read receipts: read field set to true + read_at timestamp when viewed.</li>
                <li>Unread count badge shown live in the navigation bar.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Project Messages (Real-Time, Scope-Scoped) — Deployed April 9, 2026</h4>
              <p className="text-slate-600">A third separate messaging layer embedded directly inside active Scope of Work records. Real-time — no page refresh required.</p>
              <ul className="list-disc list-inside text-slate-600 space-y-1 mt-2">
                <li>Each ProjectMessage record is tied to a specific scope_id.</li>
                <li>Only the contractor and client for that scope can see the thread.</li>
                <li>Messages appear instantly via real-time subscription.</li>
                <li>Green "Live" indicator confirms active connection.</li>
                <li>Unread messages auto-marked as read when thread is viewed.</li>
                <li>Location: Business Hub → Jobs & Projects → Scopes → expand any approved scope → scroll below milestones.</li>
              </ul>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
              <strong>SMS Hub:</strong> The SMS Hub (<code className="bg-slate-100 px-1 rounded">/sms-hub</code>) is available for WAVE Premium subscribers. It shows full SMS conversation threads with clients — phone number based, not email based. SMS messages are stored as SMSMessage records separate from in-app messages.
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 28,
    title: 'Consumer Hub & Market Directory',
    sections: [
      {
        id: '28.1',
        title: 'Consumer Hub Overview',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The Consumer Hub (<code className="bg-slate-100 px-1 rounded">/ConsumerHub</code>) is the landing area for consumer accounts (Market Shop shoppers). Consumer accounts are completely separated from the service side — they cannot browse contractors or post service jobs.</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>Market Listing Browser:</strong> Browse all active vendor product listings by category, location, or keyword.</li>
              <li><strong>MarketShop Browser:</strong> Discover and follow individual vendor shops — farmers market booths, swap meet spaces, flea market sellers.</li>
              <li><strong>Shopping Cart:</strong> Add items from multiple vendors to a cart and check out via Stripe.</li>
              <li><strong>My Orders:</strong> View order history, payment records, and order status.</li>
              <li><strong>Wishlist:</strong> Save favorite products for future purchase.</li>
              <li><strong>Saved Vendors:</strong> Follow specific shops to see their schedule and new listings.</li>
              <li><strong>Payment Methods:</strong> Manage saved cards for checkout.</li>
              <li><strong>Consumer Tier Display:</strong> Shows consumer badge tier based on order history.</li>
              <li><strong>Consumer Messaging:</strong> Contact vendors directly from their shop profile.</li>
            </ul>
          </div>
        ),
      },
      {
        id: '28.2',
        title: 'Market Directory & Vendor Browsing',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The Market Directory (<code className="bg-slate-100 px-1 rounded">/MarketDirectory</code>) is a public directory of all registered market shops and vendor booths. No login required to browse.</p>
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>Booths & Vendors Map:</strong> <code className="bg-slate-100 px-1 rounded">/BoothsAndVendorsMap</code> — interactive map of all vendors with their active market locations.</li>
              <li><strong>Vendor Detail Page:</strong> <code className="bg-slate-100 px-1 rounded">/vendor/:vendorId</code> — individual vendor profile: shop info, products, reviews, schedule, gallery, and contact options.</li>
              <li><strong>Location Ratings:</strong> Farmers markets and swap meet locations are rated by vendors. Ratings are aggregated and displayed. Submit at <code className="bg-slate-100 px-1 rounded">/farmers-market-ratings</code> or <code className="bg-slate-100 px-1 rounded">/swap-meet-ratings</code>.</li>
            </ul>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              <strong>Admin Location Rating Tools:</strong> Admins manage location ratings at <code className="bg-slate-100 px-1 rounded">/location-rating-admin</code>. Seeding location data is available via the bulkImportLocations backend function.
            </div>
          </div>
        ),
      },
    ],
  },
  {
    id: 29,
    title: 'Public Pages, Legal & Post Job',
    sections: [
      {
        id: '29.1',
        title: 'Public FAQ & About Pages',
        content: (
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Public FAQ (<code className="bg-slate-100 px-1 rounded">/faq</code>)</h4>
              <p className="text-slate-600">A publicly accessible reference page with common questions about the platform. Uses schema.org FAQPage structured data markup for Google AEO/SGE indexing — answers may appear directly in AI Overviews in search results. Topics: contractor lead fees, platform costs, how to join, WAVE OS, Founding 100, 5-for-1 referral loop, Market Shop/Swap Meet, licensing, after-photo requirements, and facilitation fee breakdown.</p>
            </div>
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">About Page (<code className="bg-slate-100 px-1 rounded">/About</code>)</h4>
              <p className="text-slate-600">Full SEO-optimized page covering platform identity, mission, founder story, differentiators, and product offerings. Two schema-marked FAQ entries targeting high-intent search queries. Links to WhySurfCoast and Pricing. Displays founder photo, company facts table, six differentiators, and two product cards (WAVE OS from $19/mo, WAVEshop OS at $35/mo).</p>
            </div>
          </div>
        ),
      },
      {
        id: '29.2',
        title: 'Legal Pages',
        content: (
          <div className="space-y-4">
            <ul className="list-disc list-inside text-slate-600 space-y-2">
              <li><strong>Terms of Service:</strong> Updated April 9, 2026 with AB 5 Independent Contractor compliance notice (California). Section 2 explicitly documents SurfCoast does not control, direct, or supervise how service providers perform their work.</li>
              <li><strong>Privacy Policy:</strong> Covers CCPA/CPRA rights, data collection, user rights. Official contact: <strong>privacy@surfcoastcmp.com</strong>. Responses within 45 days as required by CCPA/CPRA.</li>
              <li><strong>Compliance Guide:</strong> <code className="bg-slate-100 px-1 rounded">/ComplianceGuide</code> — contractor-facing guide explaining compliance requirements, account hold triggers, and how to resolve lock states.</li>
              <li><strong>Footer Links:</strong> Terms, Privacy Policy, "Do Not Sell My Info" (→ privacy@surfcoastcmp.com), SCMP Handbook link (<code className="bg-slate-100 px-1 rounded">/wave-handbook</code>).</li>
            </ul>
          </div>
        ),
      },
      {
        id: '29.3',
        title: 'Post Job Page',
        content: (
          <div className="space-y-4">
            <p className="text-slate-600">The Post Job page (<code className="bg-slate-100 px-1 rounded">/PostJob</code>) is accessible without login. Clients post jobs for free by providing:</p>
            <ul className="list-disc list-inside text-slate-600 space-y-1">
              <li>Job title and description</li>
              <li>Contractor type needed (trade-specific, general, or either)</li>
              <li>Specific trade if trade-specific (electrician, plumber, carpenter, HVAC, mason, roofer, painter, welder, tiler, landscaper, other)</li>
              <li>Location (address or description)</li>
              <li>Budget range (min/max) and budget type (hourly, fixed, or negotiable)</li>
              <li>Expected start date and duration</li>
              <li>Contact info (name, email, phone)</li>
              <li>Urgency level (low, medium, high, urgent)</li>
              <li>Before photos — minimum 5 photos required before the job is published</li>
            </ul>
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-800">
              <strong>Always Free:</strong> Posting a job is completely free for clients. No account required. Jobs are listed immediately and visible to matching entrepreneurs browsing the Jobs board.
            </div>
          </div>
        ),
      },
    ],
  },
];