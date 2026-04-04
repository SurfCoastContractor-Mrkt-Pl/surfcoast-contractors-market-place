import React, { useRef, useEffect, Fragment } from 'react';
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
import BoothsAndVendorsMap from './pages/BoothsAndVendorsMap';
import VendorDetail from './pages/VendorDetail';
import ContractorFinancialDashboard from './pages/ContractorFinancialDashboard';
import ContractorAccount from './pages/ContractorAccount';
import ContractorBusinessHub from './pages/ContractorBusinessHub';
import ConsumerHub from './pages/ConsumerHub';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import About from './pages/About';
import ContractorPublicProfile from './pages/ContractorPublicProfile';
import ConsumerSignup from './pages/ConsumerSignup';
import ReferralSignup from './pages/ReferralSignup';
import SearchAnalytics from './pages/SearchAnalytics';
import ContractorInquiries from './pages/ContractorInquiries';
import BecomeContractor from './pages/BecomeContractor';
import MarketShopSignup from './pages/MarketShopSignup';
import CustomerSignup from './pages/CustomerSignup';
import ProjectManagement from './pages/ProjectManagement';
import QuoteRequestWizard from './pages/QuoteRequestWizard';
import ResidentialWaveDashboard from './pages/ResidentialWaveDashboard';
import ContractorQuotesManagement from './pages/ContractorQuotesManagement';
import WaveFo from './pages/FieldOps';
import AdminWaveFo from './pages/AdminFieldOps';
import ContractorBillingHistory from './pages/ContractorBillingHistory';
import WaveFoReporting from './pages/FieldOpsReporting';
import ContractorVerificationDashboard from './pages/ContractorVerificationDashboard';
import ComplianceDashboard from './components/admin/ComplianceDashboard';
import ComplianceGuide from './pages/ComplianceGuide';
import PaymentDemo from './pages/PaymentDemo';
import TimedChatSession from './pages/TimedChatSession';
import QuoteRequestSuccess from './pages/QuoteRequestSuccess';
import NotionHub from './pages/NotionHub';
import SurfCoastPerformanceDashboard from './pages/SurfCoastPerformanceDashboard';
import SurfCoastReviewRequestsManager from './pages/SurfCoastReviewRequestsManager';
import ActivityConsolidationDashboard from './pages/ActivityConsolidationDashboard';
import SubmitConsumerOrderReview from './pages/SubmitConsumerOrderReview';
import MarketShopAnalyticsDashboard from './pages/MarketShopAnalyticsDashboard';
import MarketShopInventory from './pages/MarketShopInventory';
import ContractorServices from './pages/ContractorServices';
import JobExpenseTracker from './pages/JobExpenseTracker';
import ContractorInventoryDashboard from './pages/ContractorInventoryDashboard';
import MultiOptionProposals from './pages/MultiOptionProposals';
import CustomerPortal from './pages/CustomerPortal';
import ContractorInventory from './pages/ContractorInventory';
import AvailabilityManager from './pages/AvailabilityManager';
import QuickBooksExport from './pages/QuickBooksExport';
import AISchedulingAssistant from './pages/AISchedulingAssistant';
import QBSyncDashboard from './pages/QBSyncDashboard';
import TradeGames from './pages/TradeGames';
import GameChallenge from './pages/GameChallenge';
import GameLeaderboard from './pages/GameLeaderboard';
import SwapMeetRatings from './pages/SwapMeetRatings';
import GitHubDashboard from './pages/GitHubDashboard';
import FarmersMarketRatings from './pages/FarmersMarketRatings';
import LocationRatingAdmin from './pages/LocationRatingAdmin';
import GameAnalyticsDashboard from './pages/GameAnalyticsDashboard';
import ErrorMonitoringDashboard from './pages/ErrorMonitoringDashboard';
import DatabaseManagementDashboard from './pages/DatabaseManagementDashboard';
import ActivityAuditDashboard from './pages/ActivityAuditDashboard';
import PerformanceAnalyticsDashboard from './pages/PerformanceAnalyticsDashboard';
import SystemHealthDashboard from './pages/SystemHealthDashboard';
import AdminControlHub from './pages/AdminControlHub';
import AdminErrorLogs from './pages/AdminErrorLogs';
import PlatformTests from './pages/PlatformTests';
import APIUsageAnalyticsDashboard from './pages/APIUsageAnalyticsDashboard';
import AdvancedAnalyticsDashboard from './pages/AdvancedAnalyticsDashboard';
import AlertManagementDashboard from './pages/AlertManagementDashboard';
import RemediationDashboard from './pages/RemediationDashboard';
import Admin from './pages/Admin';
import PlatformActivityDashboard from './pages/PlatformActivityDashboard';
import ContractorJobPipeline from './pages/ContractorJobPipeline';
import Phase4CollaborationPanel from '@/components/fieldops/Phase4CollaborationPanel';
import Phase4CollaborationHub from './pages/Phase4CollaborationHub';
import Pricing from './pages/Pricing';
import WhySurfCoast from './pages/WhySurfCoast';
import ContractorWorkloadHub from './pages/ContractorWorkloadHub';
import SMSHub from './pages/SMSHub';
import WAVEHandbook from './pages/WAVEHandbook';
import WaveFOAbout from './pages/WaveFOAbout';
import ContractorMyDay from './pages/ContractorMyDay';
import TradeLanding from './pages/TradeLanding';
import ContractorTrialDashboard from './pages/ContractorTrialDashboard';
import CustomerTrialDashboard from './pages/CustomerTrialDashboard';
import SubscriptionUpgrade from './pages/SubscriptionUpgrade';
import BillingHistory from './pages/BillingHistory';
import SubscriptionSuccess from './pages/SubscriptionSuccess';
import AdminGuard from '@/components/auth/AdminGuard';
import { ConsumerModeProvider } from '@/lib/ConsumerModeContext';

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
  return (
    <>
    <PageGradientApplier />
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
      <Route path="/ContractorAccount" element={
        <LayoutWrapper currentPageName="ContractorAccount">
          <ContractorAccount />
        </LayoutWrapper>
      } />
      <Route path="/contractorAccount" element={
        <Navigate to="/ContractorAccount" replace />
      } />
      <Route path="/ContractorBillingHistory" element={
        <LayoutWrapper currentPageName="ContractorBillingHistory">
          <ContractorBillingHistory />
        </LayoutWrapper>
      } />
      <Route path="/ContractorBusinessHub" element={
        <LayoutWrapper currentPageName="ContractorBusinessHub">
          <ContractorBusinessHub />
        </LayoutWrapper>
      } />
      <Route path="/ContractorFinancialDashboard" element={
        <LayoutWrapper currentPageName="ContractorFinancialDashboard">
          <ContractorFinancialDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ContractorInquiries" element={
        <LayoutWrapper currentPageName="ContractorInquiries">
          <ContractorInquiries />
        </LayoutWrapper>
      } />
      <Route path="/ContractorQuotesManagement" element={
        <LayoutWrapper currentPageName="ContractorQuotesManagement">
          <ContractorQuotesManagement />
        </LayoutWrapper>
      } />
      <Route path="/ContractorVerificationDashboard" element={
        <LayoutWrapper currentPageName="ContractorVerificationDashboard">
          <ContractorVerificationDashboard />
        </LayoutWrapper>
      } />
      <Route path="/contractor/:contractorId" element={
        <LayoutWrapper currentPageName="ContractorPublicProfile">
          <ContractorPublicProfile />
        </LayoutWrapper>
      } />
      <Route path="/contractor-inventory" element={
        <LayoutWrapper currentPageName="ContractorInventoryDashboard">
          <ContractorInventoryDashboard />
        </LayoutWrapper>
      } />
      <Route path="/contractor-inventory-management" element={
        <LayoutWrapper currentPageName="ContractorInventory">
          <ContractorInventory />
        </LayoutWrapper>
      } />
      <Route path="/contractor-services" element={
        <LayoutWrapper currentPageName="ContractorServices">
          <ContractorServices />
        </LayoutWrapper>
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
      <Route path="/job-pipeline" element={
        <LayoutWrapper currentPageName="ContractorJobPipeline">
          <ContractorJobPipeline />
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
      <Route path="/workload-hub" element={
        <LayoutWrapper currentPageName="ContractorWorkloadHub">
          <ContractorWorkloadHub />
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
      <Route path="/my-day" element={
        <LayoutWrapper currentPageName="ContractorMyDay">
          <ContractorMyDay />
        </LayoutWrapper>
      } />
      <Route path="/contractors/:slug" element={
        <LayoutWrapper currentPageName="TradeLanding">
          <TradeLanding />
        </LayoutWrapper>
      } />
      <Route path="/contractor-trial" element={
        <LayoutWrapper currentPageName="ContractorTrialDashboard">
          <ContractorTrialDashboard />
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