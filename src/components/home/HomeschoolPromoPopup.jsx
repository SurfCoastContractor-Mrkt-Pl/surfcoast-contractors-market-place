import { useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeschoolPromoPopup() {
  const [visible, setVisible] = useState(true);

  const dismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="relative flex items-center justify-between gap-6">
          <button
            onClick={dismiss}
            className="absolute top-0 right-0 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left Content */}
          <div className="flex-1 pr-12">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎓</span>
              <h2 className="text-2xl font-bold">Homeschool Educators Wanted!</h2>
            </div>
            <p className="text-blue-100 text-sm">
              Connect with thousands of U.S. families searching for qualified educators. Set your own curriculum, earn competitive rates, and make a real difference.
            </p>
          </div>

          {/* Right CTA */}
          <div className="flex-shrink-0">
            <Link
              to="/ContractorSignup"
              onClick={dismiss}
              className="inline-block bg-white text-blue-700 hover:bg-blue-50 font-semibold py-2.5 px-6 rounded-lg transition-colors whitespace-nowrap"
            >
              Join Now →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}