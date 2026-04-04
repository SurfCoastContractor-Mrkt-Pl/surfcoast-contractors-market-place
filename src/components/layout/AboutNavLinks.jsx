import React from 'react';
import { Link } from 'react-router-dom';
import { Info, BarChart2, DollarSign, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { name: 'About Us', path: '/About', icon: Info },
  { name: 'Why SurfCoast', path: '/WhySurfCoast', icon: BarChart2 },
  { name: 'WAVE FO Ecosystem', path: '/WaveFOAbout', icon: BookOpen },
  { name: 'Pricing', path: '/Pricing', icon: DollarSign },
];

export default function AboutNavLinks({ onLinkClick, isMobile = false }) {
  return (
    <div className={cn(isMobile ? 'space-y-1' : 'py-1')}>
      {links.map(({ name, path, icon: Icon }) => (
        <Link
          key={path}
          to={path}
          onClick={onLinkClick}
          className={cn(
            'flex items-center gap-2.5 text-sm font-medium transition-colors duration-150',
            isMobile
              ? 'px-4 py-3 rounded-xl text-slate-700 hover:bg-blue-50 hover:text-blue-700'
              : 'px-4 py-2.5 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
          )}
        >
          <Icon className="w-4 h-4 flex-shrink-0 text-blue-400" />
          {name}
        </Link>
      ))}
    </div>
  );
}