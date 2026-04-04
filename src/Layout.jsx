/* Layout v2 - Refactored for performance and maintainability */
import React, { useState, useEffect, useRef } from 'react';
import { createPageUrl } from '@/utils';
import { Briefcase, Users, Home, MessageCircle } from 'lucide-react';

import SuggestionForm from './components/suggestions/SuggestionForm';
import FloatingAgentWidget from './components/agent/FloatingAgentWidget';
import LayoutHeader from '@/components/layout/LayoutHeader';
import LayoutMobileMenu from '@/components/layout/LayoutMobileMenu';
import LayoutFooter from '@/components/layout/LayoutFooter';
import useGeoCheck from './components/security/useGeoCheck';
import { useConsumerMode } from '@/lib/ConsumerModeContext';
import { useUserData, useUserProfiles, useUnreadCount } from '@/hooks/useUserData';

const customerLinks = [
  { name: 'My Account', page: 'CustomerAccount' },
  { name: 'My Job Postings', page: 'MyJobs' },
  { name: 'Earn Credits', page: 'Referrals' },
];

const contractorLinks = [
  { name: 'My Account', page: 'ContractorAccount' },
  { name: 'Earn Credits', page: 'Referrals' },
];

export default function Layout({ children, currentPageName }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [suggestionOpen, setSuggestionOpen] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const isBackNav = useRef(false);
  const accountMenuRef = useRef(null);
  useConsumerMode();

  // Use custom hooks for user data fetching with caching
  const { user } = useUserData();
  const { isContractor, hasMarketShop, hasCustomerProfile } = useUserProfiles(user?.email);
  const { unreadCount } = useUnreadCount(user?.email);

  const isLoggedIn = !!user;

  useGeoCheck();

  const getNavLinks = (isContractor) => {
    const baseLinks = [
      { name: 'Home', page: '/', icon: Home },
    ];
    if (isContractor === true) {
      baseLinks.push({ name: 'Browse Jobs', page: 'Jobs', icon: Briefcase });
    } else if (isContractor === false) {
      baseLinks.push({ name: 'Find Entrepreneurs', page: 'FindContractors', icon: Users });
    }
    baseLinks.push({ name: 'Marketplace Messages', page: 'Messaging', icon: MessageCircle, badge: unreadCount > 0 ? unreadCount : null });
    return baseLinks;
  };

  useEffect(() => {
    const handlePopState = () => { isBackNav.current = true; };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (!isBackNav.current) {
      window.scrollTo(0, 0);
    } else {
      isBackNav.current = false;
    }
  }, [currentPageName]);



  useEffect(() => {
    const handleClickOutside = (event) => {
      if (accountMenuRef.current && !accountMenuRef.current.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close menus when clicking outside
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setAccountMenuOpen(false);
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <LayoutHeader
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        accountMenuOpen={accountMenuOpen}
        setAccountMenuOpen={setAccountMenuOpen}
        isLoggedIn={isLoggedIn}
        isContractor={isContractor}
        currentPageName={currentPageName}
        getNavLinks={getNavLinks}
        accountMenuRef={accountMenuRef}
        contractorLinks={contractorLinks}
        customerLinks={customerLinks}
        hasMarketShop={hasMarketShop}
        hasCustomerProfile={hasCustomerProfile}
        createPageUrl={createPageUrl}
      />

      <LayoutMobileMenu
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        isLoggedIn={isLoggedIn}
        isContractor={isContractor}
        currentPageName={currentPageName}
        getNavLinks={getNavLinks}
        contractorLinks={contractorLinks}
        customerLinks={customerLinks}
        hasMarketShop={hasMarketShop}
        hasCustomerProfile={hasCustomerProfile}
        createPageUrl={createPageUrl}
      />

      <SuggestionForm open={suggestionOpen} onClose={() => setSuggestionOpen(false)} />
      <FloatingAgentWidget open={agentOpen} onClose={() => setAgentOpen(false)} onOpen={() => setAgentOpen(true)} />

      <main className="flex-1 w-full">
        {children}
      </main>

      <LayoutFooter
        createPageUrl={createPageUrl}
        setSuggestionOpen={setSuggestionOpen}
        handbookLink="/wave-handbook"
      />
    </div>
  );
}