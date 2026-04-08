import React, { useState } from 'react';
import { Lightbulb, Send, CheckCircle, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function ToolSuggestionBox({ lineOfWork, submitterEmail, submitterName }) {
  const [suggestion, setSuggestion] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!lineOfWork) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!suggestion.trim() || suggestion.trim().length < 20) {
      setError('Please describe the tool in at least a sentence or two so we can understand it.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await base44.functions.invoke('submitToolSuggestion', {
        line_of_work: lineOfWork,
        raw_suggestion: suggestion.trim(),
        submitter_email: submitterEmail || '',
        submitter_name: submitterName || '',
      });
      setSubmitted(true);
    } catch (err) {
      setError('Could not submit your suggestion right now. You can always share this later.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl p-4 flex items-start gap-3" style={{ background: '#F0FDF4', border: '1px solid #86EFAC' }}>
        <CheckCircle className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#16A34A' }} />
        <div>
          <p className="font-bold text-sm" style={{ color: '#15803D' }}>Thanks for the suggestion!</p>
          <p className="text-xs mt-0.5" style={{ color: '#166534' }}>
            Our team reviews all submissions. If enough entrepreneurs in your field request the same tool, we'll work on adding it to the platform.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 rounded-xl overflow-hidden" style={{ border: '1px solid #D9B88A', boxShadow: '2px 2px 0px #5C3500' }}>
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ background: '#FBF5EC', borderBottom: '1px solid #D9B88A' }}>
        <Lightbulb className="w-4 h-4" style={{ color: '#92400E' }} />
        <span className="font-bold text-xs" style={{ fontFamily: 'monospace', fontStyle: 'italic', color: '#5C3500', letterSpacing: '0.05em' }}>
          // SUGGEST A TOOL FOR YOUR FIELD
        </span>
      </div>

      <div className="p-4" style={{ background: '#fff' }}>
        <p className="text-xs mb-3" style={{ color: '#555', lineHeight: 1.6 }}>
          Is there a specific online tool, software, or service that would help you work better as a{' '}
          <strong style={{ color: '#1A1A1B' }}>{lineOfWork.replace(/_/g, ' ')}</strong>?
          Tell us what it is, what it does, and why it matters for your work.
        </p>

        <form onSubmit={handleSubmit}>
          <textarea
            value={suggestion}
            onChange={(e) => { setSuggestion(e.target.value); setError(''); }}
            placeholder={`Example: "As a ${lineOfWork.replace(/_/g, ' ')}, I use [Tool Name] which is a project quoting tool. It lets me generate line-item estimates on my phone in the field. Without it I used to have to go home and do it on a computer. It's something every ${lineOfWork.replace(/_/g, ' ')} from apprentice to expert would benefit from..."`}
            rows={5}
            maxLength={1000}
            className="w-full rounded-lg text-sm resize-none"
            style={{
              border: '1px solid #D0D0D2',
              padding: '10px 12px',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              color: '#1A1A1B',
              outline: 'none',
              background: '#FAFAFA',
            }}
          />
          <div className="flex justify-between items-center mt-1 mb-3">
            <span className="text-xs" style={{ color: '#999' }}>{suggestion.length}/1000 characters</span>
            <span className="text-xs" style={{ color: '#999', fontStyle: 'italic' }}>Optional — skip if nothing comes to mind</span>
          </div>

          {error && (
            <p className="text-xs mb-3" style={{ color: '#DC2626', fontStyle: 'italic' }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting || !suggestion.trim()}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition-opacity disabled:opacity-40"
            style={{
              background: '#1A1A1B',
              color: '#F0E0C0',
              fontFamily: 'monospace',
              fontStyle: 'italic',
              border: 'none',
              cursor: submitting || !suggestion.trim() ? 'not-allowed' : 'pointer',
              boxShadow: '2px 2px 0px #5C3500',
            }}
          >
            {submitting ? (
              <><Loader2 className="w-3 h-3 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-3 h-3" /> Submit Suggestion</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}