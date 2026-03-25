/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AccountRecovery from './pages/AccountRecovery';
import Admin from './pages/Admin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPreview from './pages/AdminPreview';
import AgentDemo from './pages/AgentDemo';
import BadgeShowcase from './pages/BadgeShowcase';
import BecomeContractor from './pages/BecomeContractor';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Cancel from './pages/Cancel';
import ContractorAccount from './pages/ContractorAccount';
import ContractorProfile from './pages/ContractorProfile';
import ContractorSignup from './pages/ContractorSignup';
import Contractors from './pages/Contractors';
import CustomerAccount from './pages/CustomerAccount';
import CustomerSignup from './pages/CustomerSignup';
import Dashboard from './pages/Dashboard';
import DisputeCenter from './pages/DisputeCenter';
import FindContractors from './pages/FindContractors';
import JobDetails from './pages/JobDetails';
import Jobs from './pages/Jobs';
import MarketDirectory from './pages/MarketDirectory';
import MarketShopDashboard from './pages/MarketShopDashboard';
import MarketShopProfile from './pages/MarketShopProfile';
import MarketShopSignup from './pages/MarketShopSignup';
import Messaging from './pages/Messaging';
import MyJobs from './pages/MyJobs';
import PaymentHistory from './pages/PaymentHistory';
import PostJob from './pages/PostJob';
import PrivacyPolicy from './pages/PrivacyPolicy';
import ProjectManagement from './pages/ProjectManagement';
import QuickJobPost from './pages/QuickJobPost';
import Referrals from './pages/Referrals';
import RegionBlocked from './pages/RegionBlocked';
import Success from './pages/Success';
import Terms from './pages/Terms';
import TimedChat from './pages/TimedChat';
import TimedChatPage from './pages/TimedChatPage';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccountRecovery": AccountRecovery,
    "Admin": Admin,
    "AdminDashboard": AdminDashboard,
    "AdminPreview": AdminPreview,
    "AgentDemo": AgentDemo,
    "BadgeShowcase": BadgeShowcase,
    "BecomeContractor": BecomeContractor,
    "Blog": Blog,
    "BlogDetail": BlogDetail,
    "Cancel": Cancel,
    "ContractorAccount": ContractorAccount,
    "ContractorProfile": ContractorProfile,
    "ContractorSignup": ContractorSignup,
    "Contractors": Contractors,
    "CustomerAccount": CustomerAccount,
    "CustomerSignup": CustomerSignup,
    "Dashboard": Dashboard,
    "DisputeCenter": DisputeCenter,
    "FindContractors": FindContractors,
    "JobDetails": JobDetails,
    "Jobs": Jobs,
    "MarketDirectory": MarketDirectory,
    "MarketShopDashboard": MarketShopDashboard,
    "MarketShopProfile": MarketShopProfile,
    "MarketShopSignup": MarketShopSignup,
    "Messaging": Messaging,
    "MyJobs": MyJobs,
    "PaymentHistory": PaymentHistory,
    "PostJob": PostJob,
    "PrivacyPolicy": PrivacyPolicy,
    "ProjectManagement": ProjectManagement,
    "QuickJobPost": QuickJobPost,
    "Referrals": Referrals,
    "RegionBlocked": RegionBlocked,
    "Success": Success,
    "Terms": Terms,
    "TimedChat": TimedChat,
    "TimedChatPage": TimedChatPage,
}

export const pagesConfig = {
    mainPage: null,
    Pages: PAGES,
    Layout: __Layout,
};