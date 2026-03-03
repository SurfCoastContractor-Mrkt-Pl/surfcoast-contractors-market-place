import React from 'react';
import { Check } from 'lucide-react';
import { format } from 'date-fns';

export default function ReadReceipt({ isRead, readAt, senderType, currentUserType }) {
  // Only show read receipt to the sender, not the recipient
  if (senderType !== currentUserType) return null;

  if (!isRead) {
    return (
      <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
        <Check className="w-3 h-3" />
        Sent
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-xs text-blue-600 mt-1">
      <Check className="w-3 h-3" />
      <Check className="w-3 h-3 -ml-1.5" />
      Read {readAt ? format(new Date(readAt), 'p') : ''}
    </div>
  );
}