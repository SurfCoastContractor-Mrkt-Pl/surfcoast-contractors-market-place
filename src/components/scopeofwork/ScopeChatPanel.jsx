import React, { useState } from 'react';
import { MessageSquare, X, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ScopeChatGate from './ScopeChatGate';

/**
 * ScopeChatPanel
 * Shows a chat button on scope rows. Handles open/closed state.
 * When open, delegates to ScopeChatGate which enforces fee/subscription access.
 * Chat is available only for "approved" scopes (both parties agreed).
 * Chat is locked for closed/rejected/cancelled scopes.
 */
export default function ScopeChatPanel({ scope, userEmail, userName, userType }) {
  const [open, setOpen] = useState(false);

  const isApproved = scope.status === 'approved';
  const isClosed = scope.status === 'closed' || scope.status === 'rejected' || scope.status === 'cancelled';
  const isPending = scope.status === 'pending_approval';

  let buttonLabel, buttonTitle, ButtonIcon, buttonClass;

  if (isClosed) {
    buttonLabel = 'Chat Closed';
    buttonTitle = 'This project has ended — chat is no longer available';
    ButtonIcon = Lock;
    buttonClass = 'opacity-50 cursor-not-allowed text-slate-500 border-slate-200';
  } else if (isPending) {
    buttonLabel = 'Awaiting Approval';
    buttonTitle = 'Chat will unlock once the customer approves the scope of work';
    ButtonIcon = Clock;
    buttonClass = 'opacity-60 cursor-not-allowed text-slate-400 border-slate-200';
  } else {
    buttonLabel = 'Project Chat';
    buttonTitle = 'Open project chat with your counterpart';
    ButtonIcon = MessageSquare;
    buttonClass = 'border-blue-300 text-blue-700 hover:bg-blue-50';
  }

  const canOpen = isApproved;

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className={`text-xs h-7 px-2.5 gap-1.5 ${buttonClass}`}
        onClick={() => canOpen && setOpen(true)}
        disabled={!canOpen}
        title={buttonTitle}
      >
        <ButtonIcon className="w-3 h-3" />
        {buttonLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
          <div
            className="w-full sm:w-[500px] mx-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            style={{ height: '80vh', maxHeight: 640 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <MessageSquare className="w-4 h-4 text-amber-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-[280px]">{scope.job_title}</p>
                  <p className="text-xs text-slate-500">
                    {userType === 'contractor'
                      ? `Customer: ${scope.customer_name}`
                      : `Contractor: ${scope.contractor_name}`}
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} className="h-8 w-8 shrink-0 ml-2">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Gate → checks fees/subscription → shows chat or paywall */}
            <div className="flex-1 overflow-hidden">
              <ScopeChatGate
                scope={scope}
                userEmail={userEmail}
                userName={userName}
                userType={userType}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}