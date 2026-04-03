import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import {
  ArrowLeft, Phone, MessageSquare, MapPin, Camera,
  CheckCircle, Clock, DollarSign, FileText, Upload,
  User, AlertCircle, Send, X, Image, ChevronRight,
  Navigation, Star, Download, Loader, Share2
} from 'lucide-react';
import { useUploadQueue } from '@/hooks/useUploadQueue';
import { useNetworkRetry } from '@/hooks/useNetworkRetry';
import { useOfflineSync } from '@/hooks/useOfflineSync';
import UploadQueueManager from './UploadQueueManager';
import GpsTracker from './GpsTracker';
import SignatureCapture from './SignatureCapture';
import MarketingToolkit from './MarketingToolkit';

const ACTION_BUTTONS = [
  { id: 'photos', label: 'Add Photos', icon: Camera, color: 'bg-purple-600' },
  { id: 'location', label: 'Capture Location', icon: Navigation, color: 'bg-cyan-600' },
  { id: 'marketing', label: 'Share/Message', icon: Share2, color: 'bg-pink-600' },
  { id: 'notes', label: 'Job Notes', icon: FileText, color: 'bg-amber-600' },
  { id: 'signature', label: 'Get Signature', icon: Send, color: 'bg-indigo-600' },
  { id: 'complete', label: 'Mark Complete', icon: CheckCircle, color: 'bg-green-600' },
];

export default function FieldJobDetail({ scope, user, onBack, onUpdate }) {
  const [activeAction, setActiveAction] = useState(null);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [downloadingInvoice, setDownloadingInvoice] = useState(false);
  const fileInputRef = useRef();
  const { queue, activeCount, addToQueue } = useUploadQueue(3);
  const { executeWithRetry } = useNetworkRetry(2, 800);
  const { addToQueue: queueAction, syncQueue } = useOfflineSync();

  const handlePhotoUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const uploadedUrls = [];
    let completedCount = 0;

    files.forEach((file) => {
      addToQueue(
        async () => {
          const { file_url } = await executeWithRetry(() =>
            base44.integrations.Core.UploadFile({ file })
          );
          uploadedUrls.push(file_url);
          completedCount++;

          // Update scope when all files complete
          if (completedCount === files.length) {
            const existing = scope.after_photo_urls || [];
            const updated = await base44.entities.ScopeOfWork.update(scope.id, {
              after_photo_urls: [...existing, ...uploadedUrls]
            });
            onUpdate(updated);
            setActiveAction(null);
          }
        },
        null,
        (error) => console.error('Photo upload failed:', error)
      );
    });
  };

  const handleSaveNote = async () => {
    if (!note.trim()) return;
    setSaving(true);
    try {
      const existing = scope.scope_summary || '';
      const updated = await base44.entities.ScopeOfWork.update(scope.id, {
        scope_summary: existing ? `${existing}\n\n[Field Note - ${new Date().toLocaleDateString()}]: ${note}` : note
      });
      onUpdate(updated);
      setNote('');
      setActiveAction(null);
    } catch {}
    setSaving(false);
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSendingMsg(true);
    try {
      await base44.entities.ProjectMessage.create({
        scope_id: scope.id,
        sender_email: user.email,
        sender_name: scope.contractor_name,
        sender_type: 'contractor',
        message: message.trim(),
      });
      await base44.integrations.Core.SendEmail({
        to: scope.client_email,
        subject: `Message from ${scope.contractor_name} — ${scope.job_title}`,
        body: `Hi ${scope.client_name},\n\n${message.trim()}\n\n— ${scope.contractor_name}`,
      });
      setMessage('');
      setActiveAction(null);
    } catch {}
    setSendingMsg(false);
  };

  const handleMarkComplete = async () => {
    // Security: only allow completion from valid in-progress states
    if (!['approved', 'active'].includes(scope.status)) return;
    setSaving(true);
    try {
      const updated = await base44.entities.ScopeOfWork.update(scope.id, {
        contractor_closeout_confirmed: true,
        completion_notes: completionNotes,
        status: 'pending_ratings',
      });
      onUpdate(updated);
      setActiveAction(null);
    } catch {}
    setSaving(false);
  };

  const handleDownloadInvoice = async () => {
    setDownloadingInvoice(true);
    try {
      const response = await base44.functions.invoke('generateFieldJobInvoice', {
        scope_id: scope.id
      });

      if (response?.data) {
        // If response contains blob data, download it
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${scope.id}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading invoice:', error);
      alert('Failed to download invoice. Please try again.');
    }
    setDownloadingInvoice(false);
  };

  const payout = scope.cost_amount ? (scope.cost_amount * 0.82).toFixed(2) : null;

  return (
    <div className="bg-slate-100 min-h-full">
      <UploadQueueManager queue={queue} activeCount={activeCount} />
      
      {/* Header */}
      <div className="sticky top-0 bg-white border-b border-slate-200 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onBack} className="p-2 -ml-2 rounded-full active:bg-slate-100">
            <ArrowLeft className="w-6 h-6 text-slate-700" />
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-slate-800 font-semibold truncate">{scope.job_title}</p>
            <p className="text-slate-500 text-xs">{scope.client_name}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Status Card */}
        <div className={`rounded-2xl p-4 border ${
          scope.status === 'approved' ? 'bg-blue-50 border-blue-200' :
          scope.status === 'pending_ratings' ? 'bg-green-50 border-green-200' :
          'bg-white border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            {scope.status === 'pending_ratings' ? (
              <CheckCircle className="w-8 h-8 text-green-400 flex-shrink-0" />
            ) : (
              <Clock className="w-8 h-8 text-blue-400 flex-shrink-0" />
            )}
            <div>
              <p className="text-slate-800 font-semibold capitalize">{scope.status?.replace(/_/g, ' ')}</p>
              {scope.agreed_work_date && (
                <p className="text-slate-500 text-sm">
                  {new Date(scope.agreed_work_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Financials</p>
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadingInvoice}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg font-semibold text-xs transition-colors"
            >
              {downloadingInvoice ? (
                <>
                  <Loader className="w-3 h-3 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  Invoice
                </>
              )}
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-500 text-sm">Job Amount</span>
                <span className="text-slate-800 font-semibold">
                ${scope.cost_amount?.toLocaleString()} {scope.cost_type === 'hourly' ? '/hr' : ''}
              </span>
            </div>
            {payout && (
              <>
                <div className="flex justify-between">
                  <span className="text-slate-500 text-sm">Platform Fee (18%)</span>
                  <span className="text-red-400 text-sm">-${(scope.cost_amount * 0.18).toFixed(2)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-slate-700 text-sm font-semibold">Your Payout</span>
                  <span className="text-green-400 font-bold text-lg">${payout}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Client Info */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200">
          <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">Client</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
              <User className="w-5 h-5 text-slate-400" />
            </div>
            <div className="flex-1">
              <p className="text-slate-800 font-semibold">{scope.client_name}</p>
              <p className="text-slate-500 text-sm">{scope.client_email}</p>
            </div>
          </div>
        </div>

        {/* Job Notes */}
        {scope.scope_summary && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">Scope / Notes</p>
            <p className="text-slate-600 text-sm leading-relaxed">{scope.scope_summary}</p>
          </div>
        )}

        {/* After Photos */}
        {scope.after_photo_urls?.length > 0 && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-3">
              After Photos ({scope.after_photo_urls.length})
            </p>
            <div className="grid grid-cols-3 gap-2">
              {scope.after_photo_urls.map((url, i) => (
                <img key={i} src={url} alt="" className="w-full aspect-square object-cover rounded-xl" />
              ))}
            </div>
          </div>
        )}

        {/* Quick Action Buttons */}
        {scope.status !== 'closed' && (
          <div className="grid grid-cols-2 gap-4">
            {ACTION_BUTTONS.filter(a => {
              if (a.id === 'complete' && scope.status === 'pending_ratings') return false;
              return true;
            }).map(action => {
              const Icon = action.icon;
              return (
                <button
                   key={action.id}
                   onClick={() => setActiveAction(activeAction === action.id ? null : action.id)}
                   className={`${action.color} text-white rounded-2xl p-4 flex flex-col items-center gap-2 active:scale-95 transition-transform min-h-[56px]`}
                 >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-semibold">{action.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Action Panels */}
        {activeAction === 'location' && (
          <GpsTracker
            onLocationCapture={async (loc) => {
              queueAction('updateLocation', { ...loc, scope_id: scope.id });
              setActiveAction(null);
            }}
          />
        )}

        {activeAction === 'signature' && ['approved', 'active'].includes(scope.status) && (
          <SignatureCapture
            onCapture={async (signatureUrl) => {
              // Security: only write signature on scopes that are in progress
              await base44.entities.ScopeOfWork.update(scope.id, {
                client_signature_url: signatureUrl,
                client_signed_scope_at: new Date().toISOString()
              });
              onUpdate({ ...scope, client_signature_url: signatureUrl });
              setActiveAction(null);
            }}
          />
        )}

        {activeAction === 'photos' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-800 font-semibold mb-3">Upload After Photos</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              capture="environment"
              className="hidden"
              onChange={handlePhotoUpload}
            />
            <button
              onClick={() => fileInputRef.current.click()}
              disabled={activeCount > 0}
              className="w-full bg-purple-600 text-white rounded-xl py-4 font-semibold flex items-center justify-center gap-2"
            >
              {activeCount > 0 ? (
                <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Uploading ({activeCount})...</>
              ) : (
                <><Camera className="w-5 h-5" /> Take Photo / Choose from Gallery</>
              )}
            </button>
          </div>
        )}

        {activeAction === 'marketing' && (
          <MarketingToolkit scope={scope} />
        )}



        {activeAction === 'notes' && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200">
            <p className="text-slate-800 font-semibold mb-3">Add Field Note</p>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Enter field notes, observations, or updates..."
              rows={5}
              className="w-full bg-slate-50 text-slate-800 rounded-xl p-4 text-base resize-none border border-slate-300 focus:outline-none focus:border-amber-500 placeholder-slate-400 min-h-[120px]"
            />
            <button
              onClick={handleSaveNote}
              disabled={saving || !note.trim()}
              className="w-full mt-3 bg-amber-600 disabled:opacity-50 text-white rounded-xl py-3 font-semibold"
            >
              {saving ? 'Saving...' : 'Save Note'}
            </button>
          </div>
        )}

        {activeAction === 'complete' && (
          <div className="bg-white rounded-2xl p-4 border border-green-300">
            <p className="text-slate-800 font-semibold mb-1">Mark Job as Complete</p>
            <p className="text-slate-500 text-sm mb-3">This will notify the client to review and approve completion, then release payment.</p>
            <textarea
              value={completionNotes}
              onChange={e => setCompletionNotes(e.target.value)}
              placeholder="Describe the completed work (optional)..."
              rows={4}
              className="w-full bg-slate-50 text-slate-800 rounded-xl p-4 text-base resize-none border border-slate-300 focus:outline-none focus:border-green-500 placeholder-slate-400 min-h-[120px]"
            />
            <button
              onClick={handleMarkComplete}
              disabled={saving}
              className="w-full mt-3 bg-green-600 text-white rounded-xl py-4 font-bold text-lg flex items-center justify-center gap-2"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <CheckCircle className="w-5 h-5" />}
              Confirm Job Complete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}