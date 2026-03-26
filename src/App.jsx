import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
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
import FieldOps from './pages/FieldOps';
import AdminFieldOps from './pages/AdminFieldOps';
import ContractorBillingHistory from './pages/ContractorBillingHistory';
import FieldOpsReporting from './pages/FieldOpsReporting';
import ContractorVerificationDashboard from './pages/ContractorVerificationDashboard';
import ComplianceDashboard from './components/admin/ComplianceDashboard';
import ComplianceGuide from './pages/ComplianceGuide';
import PaymentDemo from './pages/PaymentDemo';
import TimedChatSession from './pages/TimedChatSession';
import QuoteRequestSuccess from './pages/QuoteRequestSuccess';
import { ConsumerModeProvider } from '@/lib/ConsumerModeContext';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

// NOTE: Explicit routes (lines 73-177) take precedence over pagesConfig loop (lines 180-188).
// If adding pages to this file, check pagesConfig to avoid duplicate route definitions.

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

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
      // Redirect to login automatically
      navigateToLogin();
      return null;
    }
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
      <Route path="/FieldOps" element={<FieldOps />} />
      <Route path="/adminfieldops" element={<AdminFieldOps />} />
      <Route path="/ContractorBillingHistory" element={<ContractorBillingHistory />} />
      <Route path="/FieldOpsReporting" element={<FieldOpsReporting />} />
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
  )
}

export default App