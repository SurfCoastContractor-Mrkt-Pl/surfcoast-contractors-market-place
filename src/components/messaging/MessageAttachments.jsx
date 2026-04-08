import React from 'react';
import { FileText, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'];

function isImageFile(file) {
  if (file.type === 'image') return true;
  const ext = (file.url || '').split('.').pop().toLowerCase().split('?')[0];
  return IMAGE_EXTENSIONS.includes(ext);
}

export default function MessageAttachments({ files, onRemove, isReadOnly = false }) {
  if (!files || files.length === 0) return null;

  return (
    <div className="space-y-2">
      {files.map((file, idx) => (
        <div key={idx} className="relative">
          {isImageFile(file) ? (
            <div className="relative inline-block group">
              <a href={file.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={file.url}
                  alt={file.name || 'Image attachment'}
                  className="max-w-xs max-h-60 rounded-lg border border-slate-200 object-cover cursor-pointer hover:opacity-90 transition-opacity"
                />
              </a>
              {!isReadOnly && onRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70 text-white rounded-full"
                  onClick={() => onRemove(idx)}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <a
                href={file.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:underline flex-1 min-w-0"
              >
                <FileText className="w-4 h-4 shrink-0" />
                <span className="truncate">{file.name || 'Attachment'}</span>
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
          )}
        </div>
      ))}
    </div>
  );
}