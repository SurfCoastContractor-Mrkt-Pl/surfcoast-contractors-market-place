# Platform Folder - Complete Reference
**Date**: March 26, 2026 | **Status**: Production Live | **Mode**: Stripe Live Mode

---

## PLATFORM OVERVIEW
**App Name**: SurfCoast Marketplace
**Type**: Multi-sided marketplace for contractors, customers, and market booth operators
**Technology Stack**: React 18, Tailwind CSS, TypeScript, Deno (Backend), Base44 SDK
**Database**: Dual (Production & Test)
**Timezone**: America/Los_Angeles

---

## CORE ENTITIES (23 Full Schemas)

### Contractors & Services
- **Contractor**: Profile, identity verification, compliance, licensing, insurance, equipment tracking
- **ServiceOffering**: Services with pricing (hourly/fixed/quote)
- **Equipment**: Equipment inventory management with low-stock alerts
- **AvailabilitySlot**: Contractor availability calendar

### Jobs & Scopes
- **Job**: Job postings with budget, duration, location, before photos
- **ScopeOfWork**: Project scope, cost, approval workflow, closeout, ratings
- **ProjectMilestone**: Milestone tracking within scopes
- **ProjectFile**: File uploads for projects
- **ProjectMessage**: Messaging within projects
- **ProjectTask**: Task management for projects

### Customers
- **CustomerProfile**: Customer data, preferences, tier tracking
- **CustomerScopeRequest**: Customer's scope specifications for jobs

### Market & Vendors
- **MarketShop**: Vendor shop profiles for farmers markets/swap meets
- **MarketListing**: Individual product listings
- **MarketEventSale**: Sales data from market events
- **VendorReview**: Reviews for vendors

### Communication
- **Message**: Direct messaging (paid sessions)
- **QuoteRequest**: Proposal requests from customers
- **TimedChatSession**: Time-limited chat sessions
- **TimedChatMessage**: Messages within timed sessions

### Financial
- **Payment**: Payment records and sessions
- **SavedPaymentMethod**: Stored Stripe payment methods
- **Subscription**: Subscription tracking (WAVE FO tiers, MarketShop)
- **ProgressPayment**: Phase-based payment releases
- **EscrowPayment**: Escrow for project funds

### Reviews & Ratings
- **Review**: Verified reviews from completed jobs with moderation
- **PortfolioProject**: Portfolio showcase projects

### System
- **Suggestion**: User suggestions/feedback
- **DisclaimerAcceptance**: Compliance tracking
- **User** (Built-in): Role-based (admin/user/custom)
- **ErrorLog**: Error tracking
- **SecurityAlert**: Security events
- **ActivityLog**: Audit trail
- **PerformanceMetric**: System performance monitoring
- **APIUsage**: API call tracking
- **HealthCheck**: System health

### Other Tracked Entities
- **Referral**, **Campaign**, **HomeImprovementContract**, **ProjectFolder**, **ContractorTier**, **ConsumerTier**, **ResidentialWave***, **Dispute**, **BookingRequest**, **ContentReport**, **NewsletterSubscriber**, **GameChallenge**, **UserGameSession**, **TradeGame**, **GameLeaderboard**, **SeasonalTournament**, **AITutoringSession**, **Migration**, **ComplianceAppeal**, **InvoiceCustomization**, **DocumentTemplate**, **WorkflowAutomation**, **ReviewEmailRequest**, **Quote**, **Proposal**, **ProposalOption**, **ContractorInventory**, **LowStockNotification**, **JobExpense**

---

## PAGES & ROUTES (80+ Pages)

### Main Pages
- `/` → **Home** (Landing page with hero, features, social proof)
- `/About` → About page
- `/Pricing` → Pricing (WAVE FO tiers, MarketShop, Communication fees)
- `/WhySurfCoast` → Value proposition
- `/BecomeContractor` → Multi-step contractor onboarding
- `/CustomerSignup` → Customer registration
- `/ConsumerSignup` → Consumer signup
- `/MarketShopSignup` → Vendor signup for markets

### Contractor Pages
- `/ContractorAccount` → Profile management
- `/ContractorBusinessHub` → Dashboard
- `/ContractorFinancialDashboard` → Earnings tracking
- `/ContractorBillingHistory` → Payment history
- `/ContractorQuotesManagement` → Proposal management
- `/ContractorServices` → Service offerings
- `/ContractorInquiries` → Lead pipeline
- `/ContractorJobPipeline` → Job workflow
- `/ContractorInventoryDashboard` → Equipment/inventory
- `/ContractorVerificationDashboard` → Identity/license verification
- `/AvailabilityManager` → Scheduling
- `/FieldOps` (WaveFo) → Mobile field operations suite
- `/FieldOpsReporting` → Field job reporting
- `/AISchedulingAssistant` → AI scheduling
- `/QBSyncDashboard` → QuickBooks integration
- `/QuickBooksExport` → QB data export

### Customer Pages
- `/ConsumerHub` → Customer dashboard
- `/CustomerPortal` → Customer project hub
- `/MyJobs` → Posted jobs
- `/PostJob` → Job creation
- `/QuoteRequestWizard` → Multi-step quote requests
- `/QuoteRequestSuccess` → Confirmation
- `/ProjectManagement` → Project tracking
- `/SubmitConsumerOrderReview` → Order review submission

### Market Pages
- `/BoothsAndVendorsMap` → Market directory map
- `/VendorDetail` → Individual vendor profiles
- `/vendor/:vendorId` → Vendor detail pages
- `/MarketShopAnalyticsDashboard` → Vendor analytics
- `/MarketShopInventory` → Inventory management
- `/SwapMeetRatings` → Location ratings
- `/FarmersMarketRatings` → Location ratings
- `/LocationRatingAdmin` → Admin rating management

### Payment & Finance
- `/PaymentDemo` → Payment integration testing
- `/TimedChatSession` → Timed paid chat
- `/ResidentialWaveDashboard` → Bundle management
- `/NotionHub` → Notion integration

### Specialized Dashboards
- `/SearchAnalytics` → Search analytics
- `/ContractorPublicProfile` → Public profile view (/:contractorId)
- `/SurfCoastPerformanceDashboard` → Performance metrics
- `/SurfCoastReviewRequestsManager` → Review request management
- `/ActivityConsolidationDashboard` → Activity feed
- `/MultiOptionProposals` → Multi-option proposals
- `/JobExpenseTracker` → Expense logging

### Trade Games & Learning
- `/TradeGames` → Game hub (under construction)
- `/challenge/:token` → Game challenges
- `/leaderboard` → Leaderboards
- `/game-analytics` → Game statistics

### Admin Pages
- `/admin` → Admin dashboard
- `/AdminControlHub` → Admin control center
- `/ComplianceDashboard` → Compliance review
- `/ComplianceGuide` → Compliance documentation
- `/ErrorMonitoringDashboard` → Error tracking
- `/DatabaseManagementDashboard` → DB management
- `/ActivityAuditDashboard` → Audit logs
- `/PerformanceAnalyticsDashboard` → System performance
- `/SystemHealthDashboard` → Health monitoring
- `/APIUsageAnalyticsDashboard` → API metrics
- `/AdvancedAnalyticsDashboard` → Advanced analytics
- `/AlertManagementDashboard` → Alert management
- `/RemediationDashboard` → Issue remediation
- `/PlatformActivityDashboard` → Platform activity
- `/Phase4CollaborationHub` → Collaboration tools
- `/Location RatingAdmin` → Location management

---

## PRICING STRUCTURE

### WAVE FO (Contractors)
| Tier | Price | Features |
|------|-------|----------|
| Basic Profile | FREE | Public listing, reviews, discovery |
| WAVE Starter | $19/mo | Profile, 5 jobs, messaging, calendar, mobile |
| WAVE Pro | $39/mo | Unlimited jobs, CRM, invoicing, milestones, analytics |
| WAVE Max | $59/mo | GPS tracking, field ops, document hub, advanced features |
| WAVE FO Premium | $100/mo | AI tools, HubSpot sync, Notion, campaigns, leaderboards |
| WAVE Residential Bundle | $125/mo | ALL features + unlimited messaging ($50 value included) |

### MarketShop (Booth Operators)
- **Basic**: FREE profile
- **Pay Per Sale**: 5% facilitation fee OR
- **Subscription**: $20/month (waives 5% fee)
- **WAVEShop FO Premium**: $35/month (advanced tools, no facilitation fee)

### Communication Pricing
- **Client Messaging**: $1.50 per 10-minute session
- **Unlimited Messaging**: $50/month
- **Proposal Requests**: $1.75 per request
- **Quote Response**: FREE

### Job Facilitation
- **Contractors**: 18% platform fee on job payments
- **Payout**: 82% to contractor after fees

---

## STRIPE INTEGRATION
**Status**: Live Mode (Real Payments)

### Products & Prices
- WAVE Residential Bundle: $125.00/mo (prod_UFJxMDkWRoCG8I)
- WAVE FO Premium: $100.00/mo (prod_UFJxSbz1OcJqQZ)
- WAVE Max: $59.00/mo (prod_UFJxm6E04YMx9y)
- WAVE Pro: $39.00/mo (prod_UFJxBAprP2FfPS)
- WAVE Starter: $19.00/mo (prod_UFJx2uh0L4Pj0y)
- Market Shop Subscription: $20.00/mo (prod_UEhEi7XKTyscQk)
- WAVEShop FO: $35.00/mo (prod_UAboTqotEotMzt)
- Unlimited Communication: $50.00/mo
- Limited Communication: $1.50 per session
- Quote Requests: $1.75 per request

### Environment Variables
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- Product/Price IDs stored as secrets for easy updates

---

## BACKEND FUNCTIONS (100+ Functions)

### Payment Processing
- `createJobPayment`, `createPaymentCheckout`, `handlePaymentWebhook`
- `createTimedChatCheckout`, `createQuoteRequestCheckout`, `verifyPayment`
- `createMarketShopCheckout`, `createVendorCheckout`, `handleMarketShopSubscriptionWebhook`
- `handleSubscriptionWebhook`, `handleInvoicePaymentWebhook`
- `createStripeConnectOnboarding`, `createSetupIntent`, `setupPaymentMethod`
- `deletePaymentMethod`, `updatePaymentMethod`

### Contractor Management
- `contractorSignup`, `completeIdentityVerification`, `validateContractorRegistration`
- `syncContractorStripeStatus`, `checkPaymentCompliance`
- `calculateContractorTier`, `initializeContractorTier`, `notifyAdminBadgeMilestone`

### Job & Quote Management
- `submitQuoteRequest`, `submitQuote`, `respondToQuote`, `createQuoteRequest`
- `matchJobsToContractors`, `recommendCompetitiveMatches`
- `approveProgressPayment`, `releaseProgressPayment`, `releaseProgressPaymentPayout`

### Review & Rating System
- `submitReview`, `onReviewCreated`, `onReviewCreatedOrUpdated`
- `moderateReview`, `createReviewEmailRequest`, `submitVendorReview`
- `createTestimonialFromReview`, `triggerReviewEmailOnJobClose`

### Compliance & Verification
- `completeIdentityVerification`, `validateContractJurisdiction`
- `checkMinorHoursOnScope`, `resetMinorWeeklyHours`, `enforceAfterPhotoDeadline`
- `checkAfterPhotoDeadlines`

### Document & File Management
- `extractDocumentData`, `exportToQuickBooksCSV`, `generateInvoiceOnCloseout`
- `generateInvoicePDF`, `generateQuotePDF`, `generateEnhancedInvoicePDF`
- `generateFieldJobInvoice`, `generatePhaseInvoice`, `generatePaymentInvoice`
- `generateContractorAgreement`, `createProjectFolder`, `addDocumentToFolder`
- `shareProjectFolderWithCustomer`

### Analytics & Reporting
- `generateAnalyticsInsights`, `getContractorAnalytics`, `getMarketShopAnalytics`, `getVendorAnalytics`
- `generateFieldOpsReport`, `getPlatformActivitySummary`
- `logAPIUsage`, `logActivity`, `logErrorEvent`, `logHealthCheck`, `logPerformanceMetrics`

### Integrations
- `notionAutoSync`, `notionPollScheduled`, `notionProjectDoc`
- `logActivityToHubSpot`, `syncContactToHubSpot`, `syncDealToHubSpot`
- `quickBooksSync`, `exportToQuickBooksCSV`

### Game & Gamification
- `completeGameSession`, `createGameChallenge`, `updateGameStats`, `calculateGameAchievements`
- `updateGameStatistics`, `calculateGameRewardTier`, `recommendGameRecommendations`
- `createCompetitiveMatch`, `completeMatchSession`, `updateLeaderboards`, `updateLiveMatchScore`
- `calculateTournamentStandings`

### Automation & Scheduling
- `cleanupExpiredDemoProfiles`, `cleanupStaleQuotes`, `cleanupPaymentMethods`
- `cleanupStaleCheckoutSessions`, `deleteExpiredJobs`
- `refundDuplicateCharges`, `trialExpirationReminder`, `checkLowStockAndAlert`
- `scheduledLowStockCheck`, `sendScheduledReviewEmails`

### Utility & Helpers
- `sendAdminContactMessage`, `sendEmailHelper`, `sendEmailVerification`, `sendPhoneVerification`
- `sendSMS`, `sendReferralLink`, `sendReviewRequestEmail`
- `sendDocumentAlert`, `sendJobStatusEmail`, `sendJobCompletionEmail`
- `sendComplianceNotification`, `sendCustomerWelcomeEmail`, `sendConsumerReviewEmail`
- `submitContentReport`, `submitDispute`, `submitDisputeWithPaymentPause`, `resolveDispute`

### Data Management
- `seedDemoData`, `seedRealisticDemoProfiles`, `populateDemoProfiles`, `populateDemoCustomersAndReviews`
- `seedAdditionalTradeGames`, `seedPhase5DemoData`, `seedLocationRatings`
- `bulkDataExport`, `bulkImportLocations`, `applyMigration`, `runComprehensiveTest`

### Security & Admin
- `verifyAdminPassword`, `verifyAdminPasswordSecure`, `hashAdminPassword`
- `fraudCheck`, `checkSuspiciousActivity`, `detectOffPlatformPayment`
- `rlsAuditValidator`, `checkPermission`, `authMiddleware`

---

## KEY FEATURES

### Phase 1: Contractor & Job Marketplace
- Contractor profiles with verification
- Job posting & discovery
- Direct messaging (paid)
- Quote requests & proposals
- Scope of work management
- Job completion & closeout

### Phase 2: Reviews & Ratings
- Verified reviews from completed jobs
- AI moderation with penalties
- Contractor feedback loop
- Tier system (badges based on reviews)

### Phase 3: Project Management
- Milestone tracking
- File sharing
- Real-time collaboration
- Progress payments
- Escrow management

### Phase 4: Advanced Field Operations
- GPS job tracking
- Mobile field suite (WaveFo)
- Field invoicing
- After-photo requirements
- Real-time reporting

### Phase 5: Multi-Sided Platform
- MarketShop (Farmers markets/swap meets)
- Trade games & gamification
- Advanced CRM (HubSpot sync)
- AI tools (scheduling, bio generation)
- Residential Wave invoicing

---

## COMPONENT ARCHITECTURE

### Layout Components
- `Layout` (main wrapper with header, footer, menus)
- `LayoutHeader` (navigation & account menu)
- `LayoutMobileMenu` (mobile navigation)
- `LayoutFooter` (footer with links)

### Reusable UI Components (Shadcn)
- Card, Button, Badge, Input, Textarea
- Select, Checkbox, Radio, Toggle, Tabs
- Dialog, AlertDialog, Popover, Sheet
- Table, Calendar, Form elements

### Custom Components (Domain-Specific)
- **Contractor**: ProfileEditor, AvailabilityCalendar, ServicePackageManager, LicenseVerificationDashboard, EquipmentManager
- **Customer**: JobsManager, ProfileEditor, QuotesTab
- **Market**: MarketShopBrowser, ProductListingForm, VendorAnalyticsDashboard
- **Chat**: ChatWindow, TimedChatGate, PersistentChatSidebar
- **Projects**: ProjectOverview, MilestoneTracker, FileManager, ChatPanel
- **Finance**: PaymentGate, SavedPaymentMethods, InvoiceCustomization
- **Reviews**: ReviewForm, ReviewsDisplay, RatingForm
- **Games**: TradeGameViewer, GameChallengeCreator, LeaderboardDisplay

---

## AUTHENTICATION & SECURITY

### User Types
- **Contractors**: Service providers (multiple tiers)
- **Customers**: Job posters
- **Consumers**: Marketplace buyers
- **Vendors**: Booth operators
- **Admins**: Platform management

### RLS (Row-Level Security)
- User can only access own data
- Admins can access all data
- Service role for backend operations
- Public reads for published profiles

### Compliance
- Identity verification (photos, government ID)
- Minor labor law enforcement (hours tracking, consent forms)
- HIS license verification for contractors
- Insurance & bond tracking
- Off-platform payment detection
- Content moderation on reviews

---

## DEPLOYMENT & ENVIRONMENT

### Tech Stack
- **Frontend**: React 18, Tailwind CSS, TypeScript
- **Backend**: Deno Deploy
- **Database**: Base44 (Custom backend as service)
- **Payments**: Stripe (Live Mode)
- **Integrations**: Notion, HubSpot, QuickBooks, Google APIs

### Secrets Managed
- STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET
- STRIPE_[PRODUCT/PRICE]_IDs (multiple)
- GOOGLE_MAPS_API_KEY
- NOTION_PROJECT_PARENT_PAGE_ID
- APP_URL, INTERNAL_SERVICE_KEY
- ADMIN credentials, ACCOUNT_RECOVERY_SECRET
- Analytics & image domain whitelists

### App Settings
- Test Database: Enabled (dev/prod separation)
- Public App: No login required (but auth available)
- Mobile Support: Full responsive design
- Timezone: America/Los_Angeles

---

## MAJOR UPDATES & TIMELINE

- **Phase 1B**: Core contractor/job marketplace complete
- **Phase 3**: Project collaboration, file sharing, milestone tracking
- **Phase 4**: Field operations suite, GPS tracking, advanced reporting
- **Phase 5**: MarketShop integration, trade games, AI tools, Residential Wave
- **Current**: Content & pricing refinements, UI consistency checks

---

## NOTES FOR FUTURE DEVELOPMENT

1. **File Refactoring**: Pricing page (605 lines) should be split into sub-components
2. **Performance**: Optimize large entity queries, implement pagination
3. **Mobile**: Continue mobile-first design improvements
4. **Accessibility**: Maintain WCAG standards across new components
5. **Testing**: Expand test coverage for payment flows
6. **Documentation**: Keep API & function docs updated
7. **Monitoring**: Leverage HealthCheck & PerformanceMetric entities

---

**Last Updated**: March 31, 2026 | **Status**: Production Ready | **Archive**: Complete Platform Snapshot