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
import AdminDashboard from './pages/AdminDashboard';
import BecomeContractor from './pages/BecomeContractor';
import ContractorAccount from './pages/ContractorAccount';
import ContractorProfile from './pages/ContractorProfile';
import Contractors from './pages/Contractors';
import CustomerAccount from './pages/CustomerAccount';
import Home from './pages/Home';
import JobDetails from './pages/JobDetails';
import Jobs from './pages/Jobs';
import PostJob from './pages/PostJob';
import Success from './pages/Success';
import Cancel from './pages/Cancel';
import PaymentHistory from './pages/PaymentHistory';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "BecomeContractor": BecomeContractor,
    "ContractorAccount": ContractorAccount,
    "ContractorProfile": ContractorProfile,
    "Contractors": Contractors,
    "CustomerAccount": CustomerAccount,
    "Home": Home,
    "JobDetails": JobDetails,
    "Jobs": Jobs,
    "PostJob": PostJob,
    "Success": Success,
    "Cancel": Cancel,
    "PaymentHistory": PaymentHistory,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};