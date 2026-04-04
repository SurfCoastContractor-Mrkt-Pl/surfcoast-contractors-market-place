/**
 * FieldOps Hamburger Menu - Mobile Navigation
 * Toggles sidebar on mobile (< 1024px)
 */
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FieldOpsHamburgerMenu({ onToggleSidebar }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    onToggleSidebar(!isOpen);
  };

  return (
    <div className="lg:hidden">
      <Button
        variant="ghost"
        size="icon"
        onClick={handleToggle}
        className="fixed top-4 left-4 z-40"
        data-test="sidebar-hamburger"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </Button>
    </div>
  );
}