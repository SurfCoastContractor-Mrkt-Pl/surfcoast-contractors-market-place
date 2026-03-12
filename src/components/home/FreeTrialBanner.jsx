import React from 'react';
import { Gift, MessageSquare, Star } from 'lucide-react';

export default function FreeTrialBanner() {
  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="flex items-center gap-3">
            <Gift className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-semibold">Free Quote Request</p>
              <p className="text-sm opacity-90">First inquiry is on us</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-semibold">3 Free Messages</p>
              <p className="text-sm opacity-90">Connect with pros instantly</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Star className="w-8 h-8 flex-shrink-0" />
            <div>
              <p className="font-semibold">24-Hour Free Featured</p>
              <p className="text-sm opacity-90">For contractors</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}