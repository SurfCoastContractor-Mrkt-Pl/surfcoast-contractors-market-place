import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, X, Loader2, CheckCircle } from 'lucide-react';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB for general files
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

export default function FileUploadZone({
  files = [],
  onChange,
  maxFiles = null,
  label = 'Upload Files',
  hint = 'Blueprints, photos, documents',
  color = 'amber',
  disabled = false,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const colorMap = {
    amber: { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500' },
    blue: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500' },
    green: { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500' },
  };
  const c = colorMap[color] || colorMap.amber;

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) return '🖼️';
    return '📎';
  };

  const processFiles = async (fileList) => {
    const valid = [];
    for (const file of fileList) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`"${file.name}" exceeds 50MB limit.`);
        continue;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        alert(`"${file.name}" file type not supported. Allowed: images, PDFs, Word, Excel, text.`);
        continue;
      }
      if (maxFiles && files.length + valid.length >= maxFiles) break;
      valid.push(file);
    }
    if (!valid.length) return;

    setUploading(true);
    setUploadProgress(valid.map(f => ({ name: f.name, done: false })));

    const uploaded = [];
    for (let i = 0; i < valid.length; i++) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: valid[i] });
      uploaded.push({
        url: file_url,
        name: valid[i].name,
        type: valid[i].type.startsWith('image/') ? 'image' : 'document'
      });
      setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, done: true } : p));
    }

    onChange([...files, ...uploaded]);
    setUploading(false);
    setUploadProgress([]);
  };

  const handleFileChange = (e) => {
    processFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  };

  const removeFile = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); !disabled && setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && !disabled && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full min-h-[90px] border-2 border-dashed rounded-lg cursor-pointer transition-all select-none
          ${dragging ? `${c.bg} ${c.border}` : `border-slate-300 hover:${c.border} hover:${c.bg}`}
          ${uploading || disabled ? 'pointer-events-none opacity-60' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading || disabled}
        />
        {uploading ? (
          <div className="p-3 space-y-2 w-full">
            <div className="flex items-center justify-center gap-2 text-xs font-medium text-slate-600 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploadProgress.length}...
            </div>
            <div className="space-y-1 px-4">
              {uploadProgress.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                  {p.done ? <CheckCircle className="w-3 h-3 text-green-500 shrink-0" /> : <Loader2 className="w-3 h-3 animate-spin shrink-0" />}
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-4 px-3 flex flex-col items-center gap-1">
            <Upload className={`w-5 h-5 ${c.icon}`} />
            <span className={`text-xs font-semibold ${c.text}`}>{label}</span>
            <span className="text-xs text-slate-400">Drag & drop or click · max 50MB</span>
            {hint && <span className={`text-xs ${c.text} mt-0.5`}>{hint}</span>}
          </div>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 group">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-lg shrink-0">{getFileIcon(file.name || file.url)}</span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-700 truncate">{file.name || file.url.split('/').pop()}</p>
                  <p className="text-xs text-slate-400">{file.type || 'file'}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => removeFile(idx)}
                className="p-1 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg text-xs bg-green-50 border border-green-200 text-green-700">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {files.length} file{files.length > 1 ? 's' : ''} ready
        </div>
      )}
    </div>
  );
}