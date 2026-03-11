import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import ReportContentModal from './ReportContentModal';

export default function ReportButton({
  targetUserEmail,
  targetUserName,
  contentType,
  contentPreview,
  variant = 'ghost',
  size = 'sm',
  showLabel = true,
  className = '',
}) {
  const [showReport, setShowReport] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setShowReport(true)}
        className={`text-red-600 hover:text-red-700 hover:bg-red-50 ${className}`}
      >
        <Flag className="w-4 h-4" />
        {showLabel && <span className="ml-1 text-xs">Report</span>}
      </Button>

      <ReportContentModal
        open={showReport}
        onClose={() => setShowReport(false)}
        targetUserEmail={targetUserEmail}
        targetUserName={targetUserName}
        contentType={contentType}
        contentPreview={contentPreview}
      />
    </>
  );
}