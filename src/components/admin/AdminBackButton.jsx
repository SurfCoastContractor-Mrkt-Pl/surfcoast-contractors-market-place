import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Reusable back button for admin pages.
 * - `to` (optional): explicit path to go back to. Defaults to browser history.
 * - `label` (optional): link label. Defaults to "Back".
 */
export default function AdminBackButton({ to, label = 'Back' }) {
  const navigate = useNavigate();
  const handleClick = () => {
    if (to) navigate(to);
    else navigate(-1);
  };
  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 border border-slate-300 rounded-lg px-3 py-1.5 bg-white hover:bg-slate-50 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}