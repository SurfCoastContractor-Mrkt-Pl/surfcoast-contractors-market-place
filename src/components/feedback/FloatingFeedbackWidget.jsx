import { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, MessageSquare, X, Send, CheckCircle } from 'lucide-react';
import { base44 } from '@/api/base44Client';

function getOrCreateSessionId() {
  let id = sessionStorage.getItem('sc_session_id');
  if (!id) {
    id = `anon_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem('sc_session_id', id);
  }
  return id;
}

export default function FloatingFeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null); // 'thumbs_up' | 'thumbs_down'
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if already submitted this session
  useEffect(() => {
    const done = sessionStorage.getItem('sc_feedback_done');
    if (done) setSubmitted(true);
  }, []);

  const handleSubmit = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await base44.entities.WebsiteFeedback.create({
        feedback_type: selected,
        comment: comment.trim() || null,
        page_url: window.location.pathname,
        session_id: getOrCreateSessionId(),
        user_agent: navigator.userAgent,
      });
      sessionStorage.setItem('sc_feedback_done', '1');
      setSubmitted(true);
      setTimeout(() => setOpen(false), 2000);
    } catch (e) {
      console.error('Feedback error:', e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {/* Panel */}
      {open && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-72 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-500">
            <span className="text-white font-semibold text-sm">How's your experience?</span>
            <button onClick={() => setOpen(false)} className="text-white/80 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          {submitted ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 gap-2">
              <CheckCircle className="w-10 h-10 text-green-500" />
              <p className="text-slate-700 font-semibold text-sm">Thanks for your feedback!</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Thumbs */}
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setSelected('thumbs_up')}
                  className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border-2 transition-all ${
                    selected === 'thumbs_up'
                      ? 'border-green-500 bg-green-50 text-green-600'
                      : 'border-slate-200 text-slate-500 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <ThumbsUp className="w-6 h-6" />
                  <span className="text-xs font-semibold">Love it</span>
                </button>
                <button
                  onClick={() => setSelected('thumbs_down')}
                  className={`flex flex-col items-center gap-1 px-5 py-3 rounded-xl border-2 transition-all ${
                    selected === 'thumbs_down'
                      ? 'border-red-400 bg-red-50 text-red-500'
                      : 'border-slate-200 text-slate-500 hover:border-red-300 hover:bg-red-50'
                  }`}
                >
                  <ThumbsDown className="w-6 h-6" />
                  <span className="text-xs font-semibold">Not great</span>
                </button>
              </div>

              {/* Comment */}
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Any thoughts? (optional)"
                rows={3}
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 text-slate-700 placeholder-slate-400 resize-none focus:outline-none focus:border-blue-400"
              />

              <button
                onClick={handleSubmit}
                disabled={!selected || loading}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors"
              >
                <Send className="w-4 h-4" />
                {loading ? 'Sending...' : 'Submit Feedback'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Trigger Button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-full shadow-lg transition-all hover:scale-105 active:scale-95"
        title="Rate this page"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Feedback</span>
      </button>
    </div>
  );
}