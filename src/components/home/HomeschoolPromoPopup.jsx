import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeschoolPromoPopup() {
  const [visible, setVisible] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("homeschool_box_dismissed", "true");
  };

  if (!visible || !scrolled) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-6xl mx-auto px-4">
      <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-xl overflow-hidden">
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 bg-white/20 hover:bg-white/30 rounded-full p-1.5 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="px-6 py-5 flex items-center justify-between gap-6">
          {/* Left Content */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎓</span>
              <h2 className="text-2xl font-bold">Homeschool Educators Wanted!</h2>
            </div>
            <p className="text-blue-100 text-sm mb-4">
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