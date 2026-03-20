import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import AdminPreview from './pages/AdminPreview';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import TimedChat from './pages/TimedChat';
import TimedChatPage from './pages/TimedChatPage';
import ContractorSignup from './pages/ContractorSignup';
import CustomerSignup from './pages/CustomerSignup';

import MarketShopDashboard from './pages/MarketShopDashboard';
import MarketShopSignup from './pages/MarketShopSignup';
import MarketDirectory from './pages/MarketDirectory';
import MarketShopProfile from './pages/MarketShopProfile';
import Terms from './pages/Terms';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ReferralSignup from './pages/ReferralSignup';
import RegionBlocked from './pages/RegionBlocked';

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

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
    // Only redirect to login if NOT on a public page
    const publicPaths = ['/', '/Home', '/Terms', '/PrivacyPolicy', '/MarketDirectory', '/ReferralSignup', '/FindContractors', '/Jobs', '/Blog', '/BlogDetail', '/ContractorProfile', '/Contractors', '/JobDetails', '/Landing', '/BecomeContractor', '/QuickJobPost'];
    const isPublicPath = publicPaths.some(p => window.location.pathname === p || window.location.pathname.startsWith(p)) ||
      window.location.pathname.startsWith('/shop/') ||
      window.location.pathname.startsWith('/MarketShopProfile/');
    if (!isPublicPath) {
      // Show spinner briefly while redirect happens to avoid blank screen
      navigateToLogin();
      return (
        <div className="fixed inset-0 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
        </div>
      );
    }
  }
  }

  // Render the main app
   return (
     <Routes>
       <Route path="/" element={<Navigate to="/Home" replace />} />
      <Route path="/Home" element={<LayoutWrapper currentPageName="Home"><Home /></LayoutWrapper>} />
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
      <Route path="/AdminPreview" element={<LayoutWrapper currentPageName="AdminPreview"><AdminPreview /></LayoutWrapper>} />
      <Route path="/AdminDashboard" element={<AdminDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/Dashboard" element={<LayoutWrapper currentPageName="Dashboard"><Dashboard /></LayoutWrapper>} />
      <Route path="/TimedChat" element={<LayoutWrapper currentPageName="TimedChat"><TimedChat /></LayoutWrapper>} />
      <Route path="/timed-chat/:sessionId" element={<TimedChatPage />} />
      <Route path="/ContractorSignup" element={<LayoutWrapper currentPageName="ContractorSignup"><ContractorSignup /></LayoutWrapper>} />
      <Route path="/CustomerSignup" element={<LayoutWrapper currentPageName="CustomerSignup"><CustomerSignup /></LayoutWrapper>} />
      <Route path="/ContractorDashboard" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/CustomerDashboard" element={<Navigate to="/Dashboard" replace />} />
      <Route path="/MarketShopDashboard" element={<LayoutWrapper currentPageName="MarketShopDashboard"><MarketShopDashboard /></LayoutWrapper>} />
      <Route path="/MarketShopSignup" element={<LayoutWrapper currentPageName="MarketShopSignup"><MarketShopSignup /></LayoutWrapper>} />
      <Route path="/MarketDirectory" element={<LayoutWrapper currentPageName="MarketDirectory"><MarketDirectory /></LayoutWrapper>} />
      <Route path="/shop/:id" element={<MarketShopProfile />} />
      <Route path="/MarketShopProfile/:id" element={<MarketShopProfile />} />
      <Route path="/Terms" element={<LayoutWrapper currentPageName="Terms"><Terms /></LayoutWrapper>} />
      <Route path="/PrivacyPolicy" element={<LayoutWrapper currentPageName="PrivacyPolicy"><PrivacyPolicy /></LayoutWrapper>} />
      <Route path="/ReferralSignup" element={<ReferralSignup />} />
      <Route path="/RegionBlocked" element={<RegionBlocked />} />
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App