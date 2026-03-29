import React, { useRef, useEffect, Fragment } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClientInstance } from '@/lib/query-client';
import { pagesConfig } from './pages.config';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ErrorBoundary from '@/lib/ErrorBoundary';
import BoothsAndVendorsMap from './pages/BoothsAndVendorsMap';
import VendorDetail from './pages/VendorDetail';
import ContractorFinancialDashboard from './pages/ContractorFinancialDashboard';
import ConsumerHub from './pages/ConsumerHub';
import Home from './pages/Home';
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
import Phase4CollaborationPanel from '@/components/fieldops/Phase4CollaborationPanel';
import { ConsumerModeProvider } from '@/lib/ConsumerModeContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : Fragment;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  React.createElement(Layout, { currentPageName }, children)
  : React.createElement(Fragment, null, children);

// NOTE: Explicit routes (lines 73-177) take precedence over pagesConfig loop (lines 180-188).
// If adding pages to this file, check pagesConfig to avoid duplicate route definitions.

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
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/Home" element={<Navigate to="/" replace />} />
      <Route path="/BoothsAndVendorsMap" element={
        <LayoutWrapper currentPageName="BoothsAndVendorsMap">
          <BoothsAndVendorsMap />
        </LayoutWrapper>
      } />
      <Route path="/vendor/:vendorId" element={
        <LayoutWrapper currentPageName="VendorDetail">
          <VendorDetail />
        </LayoutWrapper>
      } />
      <Route path="/ContractorFinancialDashboard" element={
        <LayoutWrapper currentPageName="ContractorFinancialDashboard">
          <ContractorFinancialDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ConsumerHub" element={
        <LayoutWrapper currentPageName="ConsumerHub">
          <ConsumerHub />
        </LayoutWrapper>
      } />
      <Route path="/About" element={
        <LayoutWrapper currentPageName="About">
          <About />
        </LayoutWrapper>
      } />
      <Route path="/contractor/:contractorId" element={
        <LayoutWrapper currentPageName="ContractorPublicProfile">
          <ContractorPublicProfile />
        </LayoutWrapper>
      } />
      <Route path="/ConsumerSignup" element={
        <LayoutWrapper currentPageName="ConsumerSignup">
          <ConsumerSignup />
        </LayoutWrapper>
      } />
      <Route path="/ReferralSignup" element={
        <LayoutWrapper currentPageName="ReferralSignup">
          <ReferralSignup />
        </LayoutWrapper>
      } />
      <Route path="/SearchAnalytics" element={
        <LayoutWrapper currentPageName="SearchAnalytics">
          <SearchAnalytics />
        </LayoutWrapper>
      } />
      <Route path="/ContractorInquiries" element={
        <LayoutWrapper currentPageName="ContractorInquiries">
          <ContractorInquiries />
        </LayoutWrapper>
      } />
      <Route path="/BecomeContractor" element={<BecomeContractor />} />
      <Route path="/MarketShopSignup" element={<MarketShopSignup />} />
      <Route path="/CustomerSignup" element={<CustomerSignup />} />
      <Route path="/ProjectManagement" element={
        <LayoutWrapper currentPageName="ProjectManagement">
          <ProjectManagement />
        </LayoutWrapper>
      } />
      <Route path="/QuoteRequestWizard" element={
        <LayoutWrapper currentPageName="QuoteRequestWizard">
          <QuoteRequestWizard />
        </LayoutWrapper>
      } />
      <Route path="/ResidentialWaveDashboard" element={
        <LayoutWrapper currentPageName="ResidentialWaveDashboard">
          <ResidentialWaveDashboard />
        </LayoutWrapper>
      } />
      <Route path="/ContractorQuotesManagement" element={
        <LayoutWrapper currentPageName="ContractorQuotesManagement">
          <ContractorQuotesManagement />
        </LayoutWrapper>
      } />
      <Route path="/WaveFo" element={<WaveFo />} />
      <Route path="/FieldOps" element={<WaveFo />} /> {/* Legacy redirect */}
      <Route path="/AdminWaveFo" element={<AdminWaveFo />} />
      <Route path="/adminfieldops" element={<AdminWaveFo />} /> {/* Legacy redirect */}
      <Route path="/ContractorBillingHistory" element={<ContractorBillingHistory />} />
      <Route path="/WaveFoReporting" element={<WaveFoReporting />} />
      <Route path="/FieldOpsReporting" element={<WaveFoReporting />} /> {/* Legacy redirect */}
      <Route path="/ContractorVerificationDashboard" element={<ContractorVerificationDashboard />} />
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
      <Route path="/PaymentDemo" element={
        <LayoutWrapper currentPageName="PaymentDemo">
          <PaymentDemo />
        </LayoutWrapper>
      } />
      <Route path="/TimedChatSession" element={
        <LayoutWrapper currentPageName="TimedChatSession">
          <TimedChatSession />
        </LayoutWrapper>
      } />
      <Route path="/QuoteRequestSuccess" element={
        <LayoutWrapper currentPageName="QuoteRequestSuccess">
          <QuoteRequestSuccess />
        </LayoutWrapper>
      } />
      <Route path="/NotionHub" element={
        <LayoutWrapper currentPageName="NotionHub">
          <NotionHub />
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
      <Route path="/ActivityConsolidationDashboard" element={
        <LayoutWrapper currentPageName="ActivityConsolidationDashboard">
          <ActivityConsolidationDashboard />
        </LayoutWrapper>
      } />
      <Route path="/review-consumer-order" element={
        <LayoutWrapper currentPageName="SubmitConsumerOrderReview">
          <SubmitConsumerOrderReview />
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
      <Route path="/contractor-services" element={
        <LayoutWrapper currentPageName="ContractorServices">
          <ContractorServices />
        </LayoutWrapper>
      } />
      <Route path="/job-expense-tracker" element={
        <LayoutWrapper currentPageName="JobExpenseTracker">
          <JobExpenseTracker />
        </LayoutWrapper>
      } />
      <Route path="/contractor-inventory" element={
        <LayoutWrapper currentPageName="ContractorInventoryDashboard">
          <ContractorInventoryDashboard />
        </LayoutWrapper>
      } />
      <Route path="/contractor-services" element={
        <LayoutWrapper currentPageName="ContractorServices">
          <ContractorServices />
        </LayoutWrapper>
      } />
      <Route path="/multi-option-proposals" element={
        <LayoutWrapper currentPageName="MultiOptionProposals">
          <MultiOptionProposals />
        </LayoutWrapper>
      } />
      <Route path="/customer-portal" element={
        <LayoutWrapper currentPageName="CustomerPortal">
          <CustomerPortal />
        </LayoutWrapper>
      } />
      <Route path="/contractor-inventory-management" element={
        <LayoutWrapper currentPageName="ContractorInventory">
          <ContractorInventory />
        </LayoutWrapper>
      } />
      <Route path="/availability-manager" element={
        <LayoutWrapper currentPageName="AvailabilityManager">
          <AvailabilityManager />
        </LayoutWrapper>
      } />
      <Route path="/quickbooks-export" element={
        <LayoutWrapper currentPageName="QuickBooksExport">
          <QuickBooksExport />
        </LayoutWrapper>
      } />
      <Route path="/ai-scheduling-assistant" element={
        <LayoutWrapper currentPageName="AISchedulingAssistant">
          <AISchedulingAssistant />
        </LayoutWrapper>
      } />
      <Route path="/qb-sync-dashboard" element={
        <LayoutWrapper currentPageName="QBSyncDashboard">
          <QBSyncDashboard />
        </LayoutWrapper>
      } />
      <Route path="/trade-games" element={
        <LayoutWrapper currentPageName="TradeGames">
          <TradeGames />
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
  );
};


function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <QueryClientProvider client={queryClientInstance}>
          <ConsumerModeProvider>
            <Router>
              <AuthenticatedApp />
            </Router>
            <Toaster />
          </ConsumerModeProvider>
        </QueryClientProvider>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App