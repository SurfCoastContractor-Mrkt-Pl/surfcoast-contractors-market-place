import React from 'react';
import { FileText, Image, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MessageAttachments({ files, onRemove, isReadOnly = false }) {
  const getFileIcon = (fileType) => {
    if (fileType === 'image') return <Image className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getFileExtension = (url) => {
    const filename = url.split('/').pop();
    return filename.split('.').pop().toUpperCase() || 'FILE';
  };

  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-blue-600 hover:underline flex-1 min-w-0"
          >
            {getFileIcon(file.type)}
            <span className="truncate">{file.name || 'Attachment'}</span>
            <span className="text-xs text-slate-400 shrink-0">({getFileExtension(file.url)})</span>
          </a>
          {!isReadOnly && onRemove && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 shrink-0 ml-2"
              onClick={() => onRemove(idx)}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}