import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Camera, ImagePlus, Loader2, X, CheckCircle, AlertTriangle, Upload } from 'lucide-react';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export default function PhotoUploadZone({
  photos = [],
  onChange,
  minPhotos = 0,
  label = 'Upload Photos',
  hint = '',
  color = 'amber', // amber | purple | blue | green
  accept = 'image/*',
  maxPhotos = null,
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const colorMap = {
    amber: { border: 'border-amber-400', bg: 'bg-amber-50', text: 'text-amber-700', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700', active: 'bg-amber-100' },
    purple: { border: 'border-purple-400', bg: 'bg-purple-50', text: 'text-purple-700', icon: 'text-purple-500', badge: 'bg-purple-100 text-purple-700', active: 'bg-purple-100' },
    blue: { border: 'border-blue-400', bg: 'bg-blue-50', text: 'text-blue-700', icon: 'text-blue-500', badge: 'bg-blue-100 text-blue-700', active: 'bg-blue-100' },
    green: { border: 'border-green-400', bg: 'bg-green-50', text: 'text-green-700', icon: 'text-green-500', badge: 'bg-green-100 text-green-700', active: 'bg-green-100' },
  };
  const c = colorMap[color] || colorMap.amber;

  const processFiles = async (files) => {
    const valid = [];
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) { alert(`"${file.name}" exceeds 10MB limit.`); continue; }
      if (!ALLOWED_TYPES.includes(file.type)) { alert(`"${file.name}" must be JPEG, PNG, or WebP.`); continue; }
      if (maxPhotos && photos.length + valid.length >= maxPhotos) break;
      valid.push(file);
    }
    if (!valid.length) return;

    setUploading(true);
    setUploadProgress(valid.map(f => ({ name: f.name, done: false })));

    const uploaded = [];
    for (let i = 0; i < valid.length; i++) {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: valid[i] });
      uploaded.push(file_url);
      setUploadProgress(prev => prev.map((p, idx) => idx === i ? { ...p, done: true } : p));
    }

    onChange([...photos, ...uploaded]);
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

  const removePhoto = (idx) => onChange(photos.filter((_, i) => i !== idx));

  const remaining = minPhotos > 0 ? Math.max(0, minPhotos - photos.length) : 0;
  const isSatisfied = minPhotos === 0 || photos.length >= minPhotos;

  return (
    <div className="space-y-3">
      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full min-h-[100px] border-2 border-dashed rounded-xl cursor-pointer transition-all select-none
          ${dragging ? `${c.active} ${c.border}` : `border-slate-300 hover:${c.border} hover:${c.bg}`}
          ${uploading ? 'pointer-events-none opacity-80' : ''}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? (
          <div className="p-4 space-y-2 w-full">
            <div className="flex items-center justify-center gap-2 text-sm font-medium text-slate-600 mb-2">
              <Loader2 className="w-4 h-4 animate-spin" /> Uploading {uploadProgress.length} photo{uploadProgress.length > 1 ? 's' : ''}...
            </div>
            <div className="space-y-1 px-6">
              {uploadProgress.map((p, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-500">
                  {p.done ? <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" /> : <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />}
                  <span className="truncate">{p.name}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 px-4 flex flex-col items-center gap-1">
            <Upload className={`w-7 h-7 ${c.icon} mb-1`} />
            <span className={`text-sm font-semibold ${c.text}`}>{label}</span>
            <span className="text-xs text-slate-400">Drag & drop or tap to browse · JPG, PNG, WebP · max 10MB each</span>
            {hint && <span className={`text-xs ${c.text} mt-0.5`}>{hint}</span>}
          </div>
        )}
      </div>

      {/* Photo Grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {photos.map((url, idx) => (
            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 group">
              <img src={url} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <X className="w-3 h-3" />
              </button>
              <div className="absolute bottom-1 left-1 bg-black/60 text-white text-xs rounded px-1">{idx + 1}</div>
            </div>
          ))}
        </div>
      )}

      {/* Status */}
      {minPhotos > 0 && (
        <div className={`flex items-center gap-2 p-2.5 rounded-lg text-sm ${isSatisfied ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-amber-50 border border-amber-200 text-amber-700'}`}>
          {isSatisfied
            ? <><CheckCircle className="w-4 h-4 shrink-0" /> {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded ✓</>
            : <><AlertTriangle className="w-4 h-4 shrink-0" /> {photos.length}/{minPhotos} — {remaining} more needed</>}
        </div>
      )}
      {minPhotos === 0 && photos.length > 0 && (
        <div className="flex items-center gap-2 p-2 rounded-lg text-xs bg-green-50 border border-green-200 text-green-700">
          <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {photos.length} photo{photos.length > 1 ? 's' : ''} uploaded
        </div>
      )}
    </div>
  );
}