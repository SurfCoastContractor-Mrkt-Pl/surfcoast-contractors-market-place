import React, { useState, useEffect } from 'react';
import { X, BookOpen, Star, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function HomeschoolPromoPopup() {
  const [visible, setVisible] = useState(false);
  const [closed, setClosed] = useState(false);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('homeschoolPromoSeen');
    if (hasSeen) return;

    // Show after 35 seconds, giving the email popup space
    const timer = setTimeout(() => setVisible(true), 35000);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setClosed(true);
    sessionStorage.setItem('homeschoolPromoSeen', 'true');
  };

  if (closed || !visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative">
        {/* Header banner */}
        <div className="relative py-8 px-6 text-center" style={{ background: 'linear-gradient(135deg, #1E5A96 0%, #1a4a7a 100%)' }}>
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex justify-center mb-3">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-3xl">🎓</span>
            </div>
          </div>
          <h2 className="text-2xl font-serif font-bold text-white leading-tight">
            Homeschool Educators<br />Wanted!
          </h2>
          <p className="text-white/80 text-sm mt-2">
            Connect with families who value personalised learning
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-700 text-sm leading-relaxed text-center mb-4">
            <strong className="text-slate-900">The future starts with education.</strong> Thousands of U.S. families 
            are choosing homeschooling and actively searching for qualified educators to guide their children.
          </p>

          <div className="space-y-2.5 mb-5">
            <div className="flex items-start gap-3 bg-amber-50 rounded-xl p-3">
              <BookOpen className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800"><strong>Set your own curriculum</strong> — tailor lessons to each child's unique learning style</p>
            </div>
            <div className="flex items-start gap-3 bg-green-50 rounded-xl p-3">
              <Star className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-800"><strong>Highly sought-after</strong> — homeschool educators are among our fastest-growing category</p>
            </div>
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-3">
              <Heart className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-sm text-blue-800"><strong>Make a real difference</strong> — investing in children's education shapes tomorrow's world</p>
            </div>
          </div>

          <Link to={createPageUrl('BecomeContractor')} onClick={handleClose}>
            <Button className="w-full text-white font-semibold text-sm py-3" style={{ backgroundColor: '#1E5A96' }}>
              📚 Join as a Homeschool Educator
            </Button>
          </Link>

          <button
            onClick={handleClose}
            className="w-full text-center text-xs text-slate-400 hover:text-slate-600 mt-3"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}