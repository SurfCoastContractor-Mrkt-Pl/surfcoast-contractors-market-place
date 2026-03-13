import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

export default function HomeschoolPromoPopup() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const dismissed = sessionStorage.getItem("homeschool_popup_dismissed");
    if (dismissed) return;
    const timer = setTimeout(() => setVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem("homeschool_popup_dismissed", "true");
  };

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={dismiss}
    >
      <div
        className="relative bg-white rounded-xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={dismiss}
          className="absolute top-3 right-3 z-10 bg-white/80 hover:bg-white rounded-full p-1 text-gray-500 hover:text-gray-800 transition-colors shadow"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="bg-blue-700 text-white px-5 pt-6 pb-4 text-center">
          <div className="text-3xl mb-1">🎓</div>
          <h2 className="text-lg font-bold">Homeschool Educators Wanted!</h2>
          <p className="text-blue-200 text-xs mt-1">Connect with U.S. families who value personalised learning</p>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <p className="text-gray-700 text-sm mb-3">
            <span className="font-semibold">The future starts with education.</span> Thousands of U.S. families are choosing homeschooling and actively searching for qualified educators.
          </p>

          <ul className="space-y-2 mb-4">
            <li className="flex items-start gap-2 bg-orange-50 rounded-lg p-2 text-sm">
              <span className="text-orange-400 mt-0.5">📋</span>
              <span><span className="font-semibold text-orange-700">Set your own curriculum</span> — tailor lessons to each child's unique learning style</span>
            </li>
            <li className="flex items-start gap-2 bg-green-50 rounded-lg p-2 text-sm">
              <span className="text-green-500 mt-0.5">⭐</span>
              <span><span className="font-semibold text-green-700">Highly sought-after</span> — homeschool educators are among our fastest-growing category</span>
            </li>
            <li className="flex items-start gap-2 bg-blue-50 rounded-lg p-2 text-sm">
              <span className="text-blue-400 mt-0.5">🤍</span>
              <span><span className="font-semibold text-blue-700">Make a real difference</span> — investing in children's education shapes tomorrow's world</span>
            </li>
          </ul>

          <Link
            to="/ContractorSignup"
            onClick={dismiss}
            className="block w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold text-center py-2.5 rounded-lg transition-colors"
          >
            🎓 Join as a Homeschool Educator
          </Link>
        </div>
      </div>
    </div>
  );
}