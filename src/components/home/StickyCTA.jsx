import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { ArrowRight } from 'lucide-react';

export default function StickyCTA({ isContractor, currentPageName }) {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const hiddenPages = ['BecomeContractor', 'QuickJobPost', 'PostJob', 'Messaging', 'AdminDashboard', 'AgentDemo', 'ContractorAccount', 'CustomerAccount', 'MyJobs'];
    if (hiddenPages.includes(currentPageName)) {
      setVisible(false);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > 250) { // Show after scrolling 250px
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial check
    handleScroll(); 

    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPageName]);

  if (!visible) {
    return null;
  }
  
  const ctaConfig = isContractor 
    ? { text: 'Browse Jobs', page: 'Jobs' }
    : { text: 'Post a Job', page: 'QuickJobPost' };

  return (
    <div className="fixed bottom-20 right-5 z-40 md:bottom-16 md:right-8">
      <style>
        {`
          @keyframes fade-in-up-sticky {
            0% { opacity: 0; transform: translateY(20px) scale(0.95); }
            100% { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-in-up-sticky {
            animation: fade-in-up-sticky 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          }
        `}
      </style>
      <Link to={createPageUrl(ctaConfig.page)}>
        <Button 
          size="lg" 
          className="text-white font-semibold shadow-2xl h-12 px-6 animate-fade-in-up-sticky" 
          style={{backgroundColor: '#1E5A96'}}
        >
          {ctaConfig.text}
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </Link>
    </div>
  );
}