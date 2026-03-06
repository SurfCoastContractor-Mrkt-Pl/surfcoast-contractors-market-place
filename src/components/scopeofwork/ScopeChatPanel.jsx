import React, { useState } from 'react';
import { MessageSquare, X, Lock, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectChat from '@/components/projects/ProjectChat';

export default function ScopeChatPanel({ scope, userEmail, userName, userType }) {
  const [open, setOpen] = useState(false);

  // Chat is only available when scope is approved (both parties agreed) and not yet closed/rejected/cancelled
  const isApproved = scope.status === 'approved';
  const isClosed = scope.status === 'closed' || scope.status === 'rejected' || scope.status === 'cancelled';
  const isPending = scope.status === 'pending_approval';

  const canChat = isApproved;

  let buttonLabel = 'Chat';
  let buttonTitle = 'Open project chat';
  let ButtonIcon = MessageSquare;
  let buttonClass = 'border-blue-300 text-blue-700 hover:bg-blue-50';

  if (isClosed) {
    buttonLabel = 'Chat Closed';
    buttonTitle = 'Chat is closed — job has ended';
    ButtonIcon = Lock;
    buttonClass = 'opacity-50 cursor-not-allowed';
  } else if (isPending) {
    buttonLabel = 'Pending';
    buttonTitle = 'Chat available once scope is approved by both parties';
    ButtonIcon = Clock;
    buttonClass = 'opacity-50 cursor-not-allowed text-slate-500';
  }

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className={`text-xs h-7 px-2 gap-1 ${buttonClass}`}
        onClick={() => canChat && setOpen(true)}
        disabled={!canChat}
        title={buttonTitle}
      >
        <ButtonIcon className="w-3 h-3" />
        {buttonLabel}
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40">
          <div className="w-full sm:w-[480px] sm:max-w-full mx-auto bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '75vh', maxHeight: 600 }}>
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-slate-50 flex-shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-amber-500" />
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate max-w-[260px]">{scope.job_title}</p>
                  <p className="text-xs text-slate-500">
                    {userType === 'contractor' ? `Customer: ${scope.customer_name}` : `Contractor: ${scope.contractor_name}`}
                  </p>
                </div>
              </div>
              <Button size="icon" variant="ghost" onClick={() => setOpen(false)} className="h-8 w-8 shrink-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Chat */}
            <div className="flex-1 overflow-hidden">
              <ProjectChat
                scopeId={scope.id}
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