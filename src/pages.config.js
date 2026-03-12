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
import AgentDemo from './pages/AgentDemo';
import BadgeShowcase from './pages/BadgeShowcase';
import BecomeContractor from './pages/BecomeContractor';
import Cancel from './pages/Cancel';
import ContractorAccount from './pages/ContractorAccount';
import ContractorProfile from './pages/ContractorProfile';
import Contractors from './pages/Contractors';
import CustomerAccount from './pages/CustomerAccount';
import DisputeCenter from './pages/DisputeCenter';
import FindContractors from './pages/FindContractors';
import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import Jobs from './pages/Jobs';
import MyJobs from './pages/MyJobs';
import PaymentHistory from './pages/PaymentHistory';
import PostJob from './pages/PostJob';
import ProjectManagement from './pages/ProjectManagement';
import RegionBlocked from './pages/RegionBlocked';
import Success from './pages/Success';
import Terms from './pages/Terms';
import QuickJobPost from './pages/QuickJobPost';
import Blog from './pages/Blog';
import BlogDetail from './pages/BlogDetail';
import Referrals from './pages/Referrals';
import Messaging from './pages/Messaging';
import LocalLanding from './pages/LocalLanding';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AccountRecovery": AccountRecovery,
    "Admin": Admin,
    "AdminDashboard": AdminDashboard,
    "AgentDemo": AgentDemo,
    "BadgeShowcase": BadgeShowcase,
    "BecomeContractor": BecomeContractor,
    "Cancel": Cancel,
    "ContractorAccount": ContractorAccount,
    "ContractorProfile": ContractorProfile,
    "Contractors": Contractors,
    "CustomerAccount": CustomerAccount,
    "DisputeCenter": DisputeCenter,
    "FindContractors": FindContractors,
    "Home": Home,
    "JobDetails": JobDetails,
    "Jobs": Jobs,
    "MyJobs": MyJobs,
    "PaymentHistory": PaymentHistory,
    "PostJob": PostJob,
    "ProjectManagement": ProjectManagement,
    "RegionBlocked": RegionBlocked,
    "Success": Success,
    "Terms": Terms,
    "QuickJobPost": QuickJobPost,
    "Blog": Blog,
    "BlogDetail": BlogDetail,
    "Referrals": Referrals,
    "Messaging": Messaging,
    "LocalLanding": LocalLanding,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};