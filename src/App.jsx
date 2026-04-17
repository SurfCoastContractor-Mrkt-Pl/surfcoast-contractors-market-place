import React, { useRef, useEffect, Fragment, lazy, Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/lib/ErrorBoundary';
import { getPageGradient } from '@/lib/pageGradient';
import AdminGuard from '@/components/auth/AdminGuard';
import { ConsumerModeProvider } from '@/lib/ConsumerModeContext';

const BoothsAndVendorsMap = lazy(() => import('./pages/BoothsAndVendorsMap'));
const VendorDetail = lazy(() => import('./pages/VendorDetail'));
const ConsumerHub = lazy(() => import('./pages/ConsumerHub'));
const Home = lazy(() => import('./pages/Home'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const About = lazy(() => import('./pages/About'));
const FindContractors = lazy(() => import('./pages/FindContractors'));
const ConsumerSignup = lazy(() => import('./pages/ConsumerSignup'));
const ReferralSignup = lazy(() => import('./pages/ReferralSignup'));
const RoleChoice = lazy(() => import('./pages/RoleChoice'));
const SearchAnalytics = lazy(() => import('./pages/SearchAnalytics'));
const BecomeContractor = lazy(() => import('./pages/BecomeContractor'));
const MarketShopSignup = lazy(() => import('./pages/MarketShopSignup'));
const CustomerSignup = lazy(() => import('./pages/CustomerSignup'));
const ProjectManagement = lazy(() => import('./pages/ProjectManagement'));
const QuoteRequestWizard = lazy(() => import('./pages/QuoteRequestWizard'));
const ResidentialWaveDashboard = lazy(() => import('./pages/ResidentialWaveDashboard'));
const WaveFo = lazy(() => import('./pages/FieldOps'));
const AdminWaveFo = lazy(() => import('./pages/AdminFieldOps'));
const WaveFoReporting = lazy(() => import('./pages/FieldOpsReporting'));
const ComplianceDashboard = lazy(() => import('./components/admin/ComplianceDashboard'));
const ComplianceGuide = lazy(() => import('./pages/ComplianceGuide'));
const PaymentDemo = lazy(() => import('./pages/PaymentDemo'));
const TimedChatSession = lazy(() => import('./pages/TimedChatSession'));
const QuoteRequestSuccess = lazy(() => import('./pages/QuoteRequestSuccess'));
const NotionHub = lazy(() => import('./pages/NotionHub'));
const SurfCoastPerformanceDashboard = lazy(() => import('./pages/SurfCoastPerformanceDashboard'));
const SurfCoastReviewRequestsManager = lazy(() => import('./pages/SurfCoastReviewRequestsManager'));
const ActivityConsolidationDashboard = lazy(() => import('./pages/ActivityConsolidationDashboard'));
const SubmitConsumerOrderReview = lazy(() => import('./pages/SubmitConsumerOrderReview'));
const ClientPortal = lazy(() => import('./pages/ClientPortal'));
const PublicFAQ = lazy(() => import('./pages/PublicFAQ'));
const MarketShopAnalyticsDashboard = lazy(() => import('./pages/MarketShopAnalyticsDashboard'));
const MarketShopInventory = lazy(() => import('./pages/MarketShopInventory'));
const JobExpenseTracker = lazy(() => import('./pages/JobExpenseTracker'));
const MultiOptionProposals = lazy(() => import('./pages/MultiOptionProposals'));
const CustomerPortal = lazy(() => import('./pages/CustomerPortal'));
const AvailabilityManager = lazy(() => import('./pages/AvailabilityManager'));
const QuickBooksExport = lazy(() => import('./pages/QuickBooksExport'));
const AISchedulingAssistant = lazy(() => import('./pages/AISchedulingAssistant'));
const QBSyncDashboard = lazy(() => import('./pages/QBSyncDashboard'));
const TradeGames = lazy(() => import('./pages/TradeGames'));
const GameChallenge = lazy(() => import('./pages/GameChallenge'));
const GameLeaderboard = lazy(() => import('./pages/GameLeaderboard'));
const SwapMeetRatings = lazy(() => import('./pages/SwapMeetRatings'));
const GitHubDashboard = lazy(() => import('./pages/GitHubDashboard'));
const FarmersMarketRatings = lazy(() => import('./pages/FarmersMarketRatings'));
const LocationRatingAdmin = lazy(() => import('./pages/LocationRatingAdmin'));
const GameAnalyticsDashboard = lazy(() => import('./pages/GameAnalyticsDashboard'));
const ErrorMonitoringDashboard = lazy(() => import('./pages/ErrorMonitoringDashboard'));
const DatabaseManagementDashboard = lazy(() => import('./pages/DatabaseManagementDashboard'));
const ActivityAuditDashboard = lazy(() => import('./pages/ActivityAuditDashboard'));
const PerformanceAnalyticsDashboard = lazy(() => import('./pages/PerformanceAnalyticsDashboard'));
const SystemHealthDashboard = lazy(() => import('./pages/SystemHealthDashboard'));
const AdminControlHub = lazy(() => import('./pages/AdminControlHub'));
const AdminErrorLogs = lazy(() => import('./pages/AdminErrorLogs'));
const PlatformTests = lazy(() => import('./pages/PlatformTests'));
const APIUsageAnalyticsDashboard = lazy(() => import('./pages/APIUsageAnalyticsDashboard'));
const AdvancedAnalyticsDashboard = lazy(() => import('./pages/AdvancedAnalyticsDashboard'));
const AlertManagementDashboard = lazy(() => import('./pages/AlertManagementDashboard'));
const RemediationDashboard = lazy(() => import('./pages/RemediationDashboard'));
const Admin = lazy(() => import('./pages/Admin'));
const PlatformActivityDashboard = lazy(() => import('./pages/PlatformActivityDashboard'));
const Phase4CollaborationPanel = lazy(() => import('@/components/fieldops/Phase4CollaborationPanel'));
const Phase4CollaborationHub = lazy(() => import('./pages/Phase4CollaborationHub'));
const PostJob = lazy(() => import('./pages/PostJob'));
const Pricing = lazy(() => import('./pages/Pricing'));
const WhySurfCoast = lazy(() => import('./pages/WhySurfCoast'));
const SMSHub = lazy(() => import('./pages/SMSHub'));
const WAVEHandbook = lazy(() => import('./pages/WAVEHandbook'));
const WaveFOAbout = lazy(() => import('./pages/WaveFOAbout'));
const TradeLanding = lazy(() => import('./pages/TradeLanding'));
const CustomerTrialDashboard = lazy(() => import('./pages/CustomerTrialDashboard'));
const SubscriptionUpgrade = lazy(() => import('./pages/SubscriptionUpgrade'));
const UnifiedDashboard = lazy(() => import('./pages/UnifiedDashboard'));
const BillingHistory = lazy(() => import('./pages/BillingHistory'));
const SubscriptionSuccess = lazy(() => import('./pages/SubscriptionSuccess'));
const WAVEOSDetails = lazy(() => import('./pages/WAVEOSDetails'));
const EntrepreneurVerificationDashboard = lazy(() => import('./pages/EntrepreneurVerificationDashboard'));
const ContractorVerificationDashboard = lazy(() => import('./pages/ContractorVerificationDashboard'));
const EntrepreneurServices = lazy(() => import('./pages/EntrepreneurServices'));
const EntrepreneurInventoryDashboard = lazy(() => import('./pages/EntrepreneurInventoryDashboard'));
const EntrepreneurInventory = lazy(() => import('./pages/EntrepreneurInventory'));
const EntrepreneurJobPipeline = lazy(() => import('./pages/EntrepreneurJobPipeline'));
const EntrepreneurMyDay = lazy(() => import('./pages/EntrepreneurMyDay'));
const EntrepreneurTrialDashboard = lazy(() => import('./pages/EntrepreneurTrialDashboard'));
const ContractorFinancialDashboard = lazy(() => import('./pages/ContractorFinancialDashboard'));
const ContractorBusinessHub = lazy(() => import('./pages/ContractorBusinessHub'));
const ContractorInquiries = lazy(() => import('./pages/ContractorInquiries'));

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : Fragment;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  React.createElement(Layout, { currentPageName }, children)
  : React.createElement(Fragment, null, children);

// NOTE: Explicit routes (lines 73-177) take precedence over pagesConfig loop (lines 180-188).
// If adding pages to this file, check pagesConfig to avoid duplicate route definitions.

// Applies the page-specific gradient segment to document.body on every route change
const PageGradientApplier = () => {
  const location = useLocation();
  useEffect(() => {
    const gradient = getPageGradient(location.pathname);
    if (gradient) {
      document.body.style.background = gradient;
      document.body.style.transition = 'background 0.6s ease';
    } else {
      // Page manages its own background — reset body to transparent
      document.body.style.background = 'transparent';
      document.body.style.transition = '';
    }
  }, [location.pathname]);
  return null;
};

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (authError?.type === 'auth_required' && !hasRedirected.current) {
      hasRedirected.current = true;
      navigateToLogin();
    }
  }, [authError, navigateToLogin]);

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // useEffect above handles the one-shot redirect; show spinner while it fires
      return (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      );
    }
    // For all other errors (unknown, timeout, etc.) — this is a public app,
    // so just render routes normally rather than blocking the entire app
  }

  // Render the main app
  const pageFallback = (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  );

  return (
    <>
    <PageGradientApplier />
    <Suspense fallback={pageFallback}>
    <Routes>
      <Route path="/" element={
        <LayoutWrapper currentPageName="Home">
          <Home />
        </LayoutWrapper>
      } />
      <Route path="/About" element={
        <LayoutWrapper currentPageName="About">
          <About />
        </LayoutWrapper>
      } />
      <Route path="/ActivityConsolidationDashboard" element={
        <LayoutWrapper currentPageName="ActivityConsolidationDashboard">
          <ActivityConsolidationDashboard />
        </LayoutWrapper>
      } />
      <Route path="/activity-audit" element={
        <LayoutWrapper currentPageName="ActivityAuditDashboard">
          <ActivityAuditDashboard />
        </LayoutWrapper>
      } />
      <Route path="/admin" element={
        <LayoutWrapper currentPageName="Admin">
          <AdminGuard>
            <Admin />
          </AdminGuard>
        </LayoutWrapper>
      } />
      <Route path="/admin-control-hub" element={
        <LayoutWrapper currentPageName="AdminControlHub">
          <AdminGuard>
            <AdminControlHub />
          </AdminGuard>
        </LayoutWrapper>
      } />
      <Route path="/admin-error-logs" element={
        <LayoutWrapper currentPageName="AdminErrorLogs">
          <AdminGuard>
            <AdminErrorLogs />
          </AdminGuard>
        </LayoutWrapper>
      } />
      <Route path="/client-portal/:token" element={
        <LayoutWrapper currentPageName="ClientPortal">
          <ClientPortal />
        </LayoutWrapper>
      } />
      <Route path="/faq" element={
        <LayoutWrapper currentPageName="PublicFAQ">
          <PublicFAQ />
        </LayoutWrapper>
      } />
      <Route path="/platform-tests" element={
        <LayoutWrapper currentPageName="PlatformTests">
          <PlatformTests />
        </LayoutWrapper>
      } />
      <Route path="/AdminWaveOS" element={
        <LayoutWrapper currentPageName="AdminWaveOS">
          <AdminWaveFo />
        </LayoutWrapper>
      } />
      <Route path="/adminfieldops" element={
        <LayoutWrapper currentPageName="AdminWaveOS">
          <AdminWaveFo />
        </LayoutWrapper>
      } />
      <Route path="/advanced-analytics" element={
        <LayoutWrapper currentPageName="AdvancedAnalyticsDashboard">
          <AdvancedAnalyticsDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ai-scheduling-assistant" element={
        <LayoutWrapper currentPageName="AISchedulingAssistant">
          <AISchedulingAssistant />
        </LayoutWrapper>
      } />
      <Route path="/alert-management" element={
        <LayoutWrapper currentPageName="AlertManagementDashboard">
          <AlertManagementDashboard />
        </LayoutWrapper>
      } />
      <Route path="/api-usage-analytics" element={
        <LayoutWrapper currentPageName="APIUsageAnalyticsDashboard">
          <APIUsageAnalyticsDashboard />
        </LayoutWrapper>
      } />
      <Route path="/availability-manager" element={
        <LayoutWrapper currentPageName="AvailabilityManager">
          <AvailabilityManager />
        </LayoutWrapper>
      } />
      <Route path="/BecomeContractor" element={
        <LayoutWrapper currentPageName="BecomeContractor">
          <BecomeContractor />
        </LayoutWrapper>
      } />
      <Route path="/BoothsAndVendorsMap" element={
        <LayoutWrapper currentPageName="BoothsAndVendorsMap">
          <BoothsAndVendorsMap />
        </LayoutWrapper>
      } />
      <Route path="/challenge/:token" element={
        <LayoutWrapper currentPageName="GameChallenge">
          <GameChallenge />
        </LayoutWrapper>
      } />
      <Route path="/collaboration" element={
        <LayoutWrapper currentPageName="Phase4CollaborationHub">
          <Phase4CollaborationHub />
        </LayoutWrapper>
      } />
      <Route path="/ComplianceDashboard" element={
        <LayoutWrapper currentPageName="ComplianceDashboard">
          <ComplianceDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ComplianceGuide" element={
        <LayoutWrapper currentPageName="ComplianceGuide">
          <ComplianceGuide />
        </LayoutWrapper>
      } />
      <Route path="/ConsumerHub" element={
        <LayoutWrapper currentPageName="ConsumerHub">
          <ConsumerHub />
        </LayoutWrapper>
      } />
      <Route path="/ConsumerSignup" element={
        <LayoutWrapper currentPageName="ConsumerSignup">
          <ConsumerSignup />
        </LayoutWrapper>
      } />







      <Route path="/SearchContractors" element={
        <LayoutWrapper currentPageName="FindContractors">
          <FindContractors />
        </LayoutWrapper>
      } />
      <Route path="/searchcontractors" element={
        <Navigate to="/SearchContractors" replace />
      } />

      <Route path="/CustomerSignup" element={
        <LayoutWrapper currentPageName="CustomerSignup">
          <CustomerSignup />
        </LayoutWrapper>
      } />
      <Route path="/customer-portal" element={
        <LayoutWrapper currentPageName="CustomerPortal">
          <CustomerPortal />
        </LayoutWrapper>
      } />
      <Route path="/database-management" element={
        <LayoutWrapper currentPageName="DatabaseManagementDashboard">
          <DatabaseManagementDashboard />
        </LayoutWrapper>
      } />
      <Route path="/error-monitoring" element={
        <LayoutWrapper currentPageName="ErrorMonitoringDashboard">
          <ErrorMonitoringDashboard />
        </LayoutWrapper>
      } />
      <Route path="/farmers-market-ratings" element={
        <LayoutWrapper currentPageName="FarmersMarketRatings">
          <FarmersMarketRatings />
        </LayoutWrapper>
      } />
      <Route path="/FieldOps" element={
        <LayoutWrapper currentPageName="WaveOS">
          <WaveFo />
        </LayoutWrapper>
      } />
      <Route path="/FieldOpsReporting" element={
        <LayoutWrapper currentPageName="WaveOSReporting">
          <WaveFoReporting />
        </LayoutWrapper>
      } />
      <Route path="/game-analytics" element={
        <LayoutWrapper currentPageName="GameAnalyticsDashboard">
          <GameAnalyticsDashboard />
        </LayoutWrapper>
      } />
      <Route path="/github-dashboard" element={
        <LayoutWrapper currentPageName="GitHubDashboard">
          <GitHubDashboard />
        </LayoutWrapper>
      } />
      <Route path="/Home" element={<Navigate to="/" replace />} />
      <Route path="/Dashboard" element={
        <LayoutWrapper currentPageName="Dashboard">
          <Dashboard />
        </LayoutWrapper>
      } />
      <Route path="/job-expense-tracker" element={
        <LayoutWrapper currentPageName="JobExpenseTracker">
          <JobExpenseTracker />
        </LayoutWrapper>
      } />

      <Route path="/leaderboard" element={
        <LayoutWrapper currentPageName="GameLeaderboard">
          <GameLeaderboard />
        </LayoutWrapper>
      } />
      <Route path="/location-rating-admin" element={
        <LayoutWrapper currentPageName="LocationRatingAdmin">
          <LocationRatingAdmin />
        </LayoutWrapper>
      } />
      <Route path="/market-shop-analytics" element={
        <LayoutWrapper currentPageName="MarketShopAnalyticsDashboard">
          <MarketShopAnalyticsDashboard />
        </LayoutWrapper>
      } />
      <Route path="/market-shop-inventory" element={
        <LayoutWrapper currentPageName="MarketShopInventory">
          <MarketShopInventory />
        </LayoutWrapper>
      } />
      <Route path="/MarketShopSignup" element={
        <LayoutWrapper currentPageName="MarketShopSignup">
          <MarketShopSignup />
        </LayoutWrapper>
      } />
      <Route path="/multi-option-proposals" element={
        <LayoutWrapper currentPageName="MultiOptionProposals">
          <MultiOptionProposals />
        </LayoutWrapper>
      } />
      <Route path="/NotionHub" element={
        <LayoutWrapper currentPageName="NotionHub">
          <NotionHub />
        </LayoutWrapper>
      } />
      <Route path="/PaymentDemo" element={
        <LayoutWrapper currentPageName="PaymentDemo">
          <PaymentDemo />
        </LayoutWrapper>
      } />
      <Route path="/performance-analytics" element={
        <LayoutWrapper currentPageName="PerformanceAnalyticsDashboard">
          <PerformanceAnalyticsDashboard />
        </LayoutWrapper>
      } />
      <Route path="/platform-activity" element={
        <LayoutWrapper currentPageName="PlatformActivityDashboard">
          <PlatformActivityDashboard />
        </LayoutWrapper>
      } />
      <Route path="/PostJob" element={
        <LayoutWrapper currentPageName="PostJob">
          <PostJob />
        </LayoutWrapper>
      } />
      <Route path="/Pricing" element={
        <LayoutWrapper currentPageName="Pricing">
          <Pricing />
        </LayoutWrapper>
      } />
      <Route path="/pricing" element={
        <LayoutWrapper currentPageName="Pricing">
          <Pricing />
        </LayoutWrapper>
      } />
      <Route path="/ProjectManagement" element={
        <LayoutWrapper currentPageName="ProjectManagement">
          <ProjectManagement />
        </LayoutWrapper>
      } />
      <Route path="/qb-sync-dashboard" element={
        <LayoutWrapper currentPageName="QBSyncDashboard">
          <QBSyncDashboard />
        </LayoutWrapper>
      } />
      <Route path="/quickbooks-export" element={
        <LayoutWrapper currentPageName="QuickBooksExport">
          <QuickBooksExport />
        </LayoutWrapper>
      } />
      <Route path="/QuoteRequestSuccess" element={
        <LayoutWrapper currentPageName="QuoteRequestSuccess">
          <QuoteRequestSuccess />
        </LayoutWrapper>
      } />
      <Route path="/QuoteRequestWizard" element={
        <LayoutWrapper currentPageName="QuoteRequestWizard">
          <QuoteRequestWizard />
        </LayoutWrapper>
      } />
      <Route path="/ReferralSignup" element={
        <LayoutWrapper currentPageName="ReferralSignup">
          <ReferralSignup />
        </LayoutWrapper>
      } />
      <Route path="/RoleChoice" element={
        <LayoutWrapper currentPageName="RoleChoice">
          <RoleChoice />
        </LayoutWrapper>
      } />
      <Route path="/remediation" element={
        <LayoutWrapper currentPageName="RemediationDashboard">
          <RemediationDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ResidentialWaveDashboard" element={
        <LayoutWrapper currentPageName="ResidentialWaveDashboard">
          <ResidentialWaveDashboard />
        </LayoutWrapper>
      } />
      <Route path="/review-consumer-order" element={
        <LayoutWrapper currentPageName="SubmitConsumerOrderReview">
          <SubmitConsumerOrderReview />
        </LayoutWrapper>
      } />
      <Route path="/SearchAnalytics" element={
        <LayoutWrapper currentPageName="SearchAnalytics">
          <SearchAnalytics />
        </LayoutWrapper>
      } />
      <Route path="/swap-meet-ratings" element={
        <LayoutWrapper currentPageName="SwapMeetRatings">
          <SwapMeetRatings />
        </LayoutWrapper>
      } />
      <Route path="/SurfCoastPerformanceDashboard" element={
        <LayoutWrapper currentPageName="SurfCoastPerformanceDashboard">
          <SurfCoastPerformanceDashboard />
        </LayoutWrapper>
      } />
      <Route path="/SurfCoastReviewRequestsManager" element={
        <LayoutWrapper currentPageName="SurfCoastReviewRequestsManager">
          <SurfCoastReviewRequestsManager />
        </LayoutWrapper>
      } />
      <Route path="/system-health" element={
        <LayoutWrapper currentPageName="SystemHealthDashboard">
          <SystemHealthDashboard />
        </LayoutWrapper>
      } />
      <Route path="/TimedChatSession" element={
        <LayoutWrapper currentPageName="TimedChatSession">
          <TimedChatSession />
        </LayoutWrapper>
      } />
      <Route path="/trade-games" element={
        <LayoutWrapper currentPageName="TradeGames">
          <TradeGames />
        </LayoutWrapper>
      } />
      <Route path="/vendor/:vendorId" element={
        <LayoutWrapper currentPageName="VendorDetail">
          <VendorDetail />
        </LayoutWrapper>
      } />
      <Route path="/WaveOS" element={
        <LayoutWrapper currentPageName="WaveOS">
          <WaveFo />
        </LayoutWrapper>
      } />
      <Route path="/WaveFoReporting" element={
        <LayoutWrapper currentPageName="WaveFoReporting">
          <WaveFoReporting />
        </LayoutWrapper>
      } />
      <Route path="/WhySurfCoast" element={
        <LayoutWrapper currentPageName="WhySurfCoast">
          <WhySurfCoast />
        </LayoutWrapper>
      } />
      <Route path="/why-surfcoast" element={
        <LayoutWrapper currentPageName="WhySurfCoast">
          <WhySurfCoast />
        </LayoutWrapper>
      } />

      <Route path="/sms-hub" element={
        <LayoutWrapper currentPageName="SMSHub">
          <SMSHub />
        </LayoutWrapper>
      } />
      <Route path="/wave-handbook" element={
        <LayoutWrapper currentPageName="WAVEHandbook">
          <WAVEHandbook />
        </LayoutWrapper>
      } />
      <Route path="/wave-os-about" element={
        <LayoutWrapper currentPageName="WaveOSAbout">
          <WaveFOAbout />
        </LayoutWrapper>
      } />

      <Route path="/contractors/:slug" element={
        <LayoutWrapper currentPageName="TradeLanding">
          <TradeLanding />
        </LayoutWrapper>
      } />

      <Route path="/customer-trial" element={
        <LayoutWrapper currentPageName="CustomerTrialDashboard">
          <CustomerTrialDashboard />
        </LayoutWrapper>
      } />
      <Route path="/SubscriptionUpgrade" element={
        <LayoutWrapper currentPageName="SubscriptionUpgrade">
          <SubscriptionUpgrade />
        </LayoutWrapper>
      } />
      <Route path="/BillingHistory" element={
        <LayoutWrapper currentPageName="BillingHistory">
          <BillingHistory />
        </LayoutWrapper>
      } />
      <Route path="/subscription-success" element={
        <LayoutWrapper currentPageName="SubscriptionSuccess">
          <SubscriptionSuccess />
        </LayoutWrapper>
      } />
      <Route path="/wave-os-details" element={
        <LayoutWrapper currentPageName="WAVEOSDetails">
          <WAVEOSDetails />
        </LayoutWrapper>
      } />
      <Route path="/EntrepreneurVerificationDashboard" element={
        <LayoutWrapper currentPageName="EntrepreneurVerificationDashboard">
          <EntrepreneurVerificationDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ContractorVerificationDashboard" element={
        <LayoutWrapper currentPageName="ContractorVerificationDashboard">
          <ContractorVerificationDashboard />
        </LayoutWrapper>
      } />
      <Route path="/EntrepreneurServices" element={
        <LayoutWrapper currentPageName="EntrepreneurServices">
          <EntrepreneurServices />
        </LayoutWrapper>
      } />
      <Route path="/EntrepreneurInventoryDashboard" element={
        <LayoutWrapper currentPageName="EntrepreneurInventoryDashboard">
          <EntrepreneurInventoryDashboard />
        </LayoutWrapper>
      } />
      <Route path="/EntrepreneurInventory" element={
        <LayoutWrapper currentPageName="EntrepreneurInventory">
          <EntrepreneurInventory />
        </LayoutWrapper>
      } />
      <Route path="/EntrepreneurJobPipeline" element={
        <LayoutWrapper currentPageName="EntrepreneurJobPipeline">
          <EntrepreneurJobPipeline />
        </LayoutWrapper>
      } />
      <Route path="/EntrepreneurMyDay" element={
        <LayoutWrapper currentPageName="EntrepreneurMyDay">
          <EntrepreneurMyDay />
        </LayoutWrapper>
      } />
      <Route path="/EntrepreneurTrialDashboard" element={
        <LayoutWrapper currentPageName="EntrepreneurTrialDashboard">
          <EntrepreneurTrialDashboard />
        </LayoutWrapper>
      } />
      <Route path="/dashboard" element={
        <LayoutWrapper currentPageName="UnifiedDashboard">
          <UnifiedDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ContractorFinancialDashboard" element={
        <LayoutWrapper currentPageName="ContractorFinancialDashboard">
          <ContractorFinancialDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ContractorBusinessHub" element={
        <LayoutWrapper currentPageName="ContractorBusinessHub">
          <ContractorBusinessHub />
        </LayoutWrapper>
      } />
      <Route path="/ContractorInquiries" element={
        <LayoutWrapper currentPageName="ContractorInquiries">
          <ContractorInquiries />
        </LayoutWrapper>
      } />
      {/* Auto-generated routes from pagesConfig - check for duplicates with explicit routes above */}
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              <Page />
            </LayoutWrapper>
          }
        />
      ))}
      <Route path="*" element={<PageNotFound />} />
    </Routes>
    </Suspense>
    </>
  );
};


function App() {

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClientInstance}>
        <ConsumerModeProvider>
          <AuthProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </AuthProvider>
        </ConsumerModeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App