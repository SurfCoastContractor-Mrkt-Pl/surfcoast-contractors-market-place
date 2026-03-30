import React from 'react';
import { useMediaQuery } from '@/hooks/use-mobile';

export default function MobileResponsiveWrapper({ children, className = '' }) {
  const isMobile = useMediaQuery('(max-width: 768px)');

  return (
    <div className={`w-full transition-all duration-300 ${className}`}>
      {React.cloneElement(children, { isMobile })}
    </div>
  );
}