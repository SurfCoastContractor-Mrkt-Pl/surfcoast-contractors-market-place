import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, ZoomIn, ZoomOut, RotateCcw, Check, X, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';

/**
 * ImageCropUploader
 * Props:
 *  - label: string
 *  - currentUrl: string | null
 *  - aspectRatio: number (e.g. 1 for square, 3 for banner)
 *  - onSave: (url: string) => void
 *  - shape: 'circle' | 'rect'
 */
export default function ImageCropUploader({ label, currentUrl, aspectRatio = 1, onSave, shape = 'rect', hint }) {
  const [rawImage, setRawImage] = useState(null);   // data URL of original
  const [cropping, setCropping] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);
  const previewRef = useRef(null);
  const fileRef = useRef(null);

  // Canvas size for crop
  const CANVAS_W = aspectRatio >= 2 ? 600 : 300;
  const CANVAS_H = Math.round(CANVAS_W / aspectRatio);

  // Draw crop preview whenever params change
  useEffect(() => {
    if (!cropping || !rawImage) return;
    const canvas = previewRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;
    if (!img) return;

    const scale = zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = (CANVAS_W - drawW) / 2 + offset.x;
    const y = (CANVAS_H - drawH) / 2 + offset.y;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Clip to shape
    ctx.save();
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2, Math.min(CANVAS_W, CANVAS_H) / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(img, x, y, drawW, drawH);
    ctx.restore();
  }, [zoom, offset, cropping, rawImage, shape, CANVAS_W, CANVAS_H]);

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setRawImage(ev.target.result);
      setZoom(1);
      setOffset({ x: 0, y: 0 });
      setCropping(true);
      // Reset after read completes so re-selecting same file works
      if (fileRef.current) fileRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const onMouseDown = (e) => {
    e.preventDefault();
    setDragging(true);
    dragStart.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };
  const onMouseMove = useCallback((e) => {
    if (!dragging) return;
    setOffset({ x: e.clientX - dragStart.current.x, y: e.clientY - dragStart.current.y });
  }, [dragging]);
  const onMouseUp = () => setDragging(false);

  const onTouchStart = (e) => {
    const t = e.touches[0];
    setDragging(true);
    dragStart.current = { x: t.clientX - offset.x, y: t.clientY - offset.y };
  };
  const onTouchMove = useCallback((e) => {
    if (!dragging) return;
    const t = e.touches[0];
    setOffset({ x: t.clientX - dragStart.current.x, y: t.clientY - dragStart.current.y });
  }, [dragging]);
  const onTouchEnd = () => setDragging(false);

  const handleSave = async () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = imgRef.current;

    const scale = zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = (CANVAS_W - drawW) / 2 + offset.x;
    const y = (CANVAS_H - drawH) / 2 + offset.y;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    if (shape === 'circle') {
      ctx.beginPath();
      ctx.arc(CANVAS_W / 2, CANVAS_H / 2, Math.min(CANVAS_W, CANVAS_H) / 2, 0, Math.PI * 2);
      ctx.clip();
    }
    ctx.drawImage(img, x, y, drawW, drawH);

    canvas.toBlob(async (blob) => {
      setSaving(true);
      try {
        const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        await onSave(file_url);
        setSaved(true);
        setCropping(false);
        setTimeout(() => setSaved(false), 2500);
      } catch (err) {
        console.error(err);
        alert('Upload failed. Please try again.');
      } finally {
        setSaving(false);
      }
    }, 'image/jpeg', 0.9);
  };

  const cancel = () => {
    setCropping(false);
    setRawImage(null);
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wide">{label}</label>
      {hint && <p className="text-xs text-slate-400">{hint}</p>}

      {/* Current image preview + upload trigger */}
      {!cropping && (
        <div
          onClick={() => fileRef.current?.click()}
          className="relative group cursor-pointer overflow-hidden border-2 border-dashed border-slate-300 hover:border-blue-400 transition-colors bg-slate-50"
          style={{
            borderRadius: shape === 'circle' ? '50%' : '12px',
            width: shape === 'circle' ? 100 : '100%',
            height: shape === 'circle' ? 100 : Math.round((shape === 'circle' ? 100 : 360) / aspectRatio),
            maxHeight: 180,
          }}
        >
          {currentUrl ? (
            <img src={currentUrl} alt={label} className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full text-slate-400 gap-1">
              <Upload className="w-5 h-5" />
              <span className="text-xs">Upload</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-inherit">
            <span className="text-white text-xs font-semibold">{currentUrl ? 'Change' : 'Upload'}</span>
          </div>
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

      {/* Crop Modal */}
      {cropping && rawImage && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 w-full max-w-lg">
            <h3 className="text-base font-bold text-slate-800 mb-1">Crop {label}</h3>
            <p className="text-xs text-slate-500 mb-4">Drag to reposition · Use zoom to fit</p>

            {/* Crop preview canvas */}
            <div
              className="relative overflow-hidden mx-auto border border-slate-200 shadow-inner"
              style={{
                width: '100%',
                maxWidth: CANVAS_W,
                aspectRatio: `${CANVAS_W} / ${CANVAS_H}`,
                borderRadius: shape === 'circle' ? '50%' : '12px',
                cursor: dragging ? 'grabbing' : 'grab',
                touchAction: 'none',
              }}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              <canvas
                ref={previewRef}
                width={CANVAS_W}
                height={CANVAS_H}
                className="w-full h-full"
              />
            </div>

            {/* Hidden img for drawing */}
            <img
              ref={imgRef}
              src={rawImage}
              alt="source"
              className="hidden"
              onLoad={() => {
                // Auto-fit on load
                const img = imgRef.current;
                const fitScale = Math.max(CANVAS_W / img.naturalWidth, CANVAS_H / img.naturalHeight);
                setZoom(fitScale);
                setOffset({ x: 0, y: 0 });
              }}
            />

            {/* Hidden output canvas */}
            <canvas ref={canvasRef} width={CANVAS_W} height={CANVAS_H} className="hidden" />

            {/* Zoom controls */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setZoom(z => Math.max(0.3, z - 0.1))} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                <ZoomOut className="w-4 h-4 text-slate-600" />
              </button>
              <input
                type="range"
                min={0.3} max={3} step={0.05}
                value={zoom}
                onChange={e => setZoom(parseFloat(e.target.value))}
                className="flex-1 accent-blue-600"
              />
              <button onClick={() => setZoom(z => Math.min(3, z + 0.1))} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50">
                <ZoomIn className="w-4 h-4 text-slate-600" />
              </button>
              <button onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }} className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50" title="Reset">
                <RotateCcw className="w-4 h-4 text-slate-600" />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={cancel}
                className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center justify-center gap-1"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save Photo'}
              </button>
            </div>
          </div>
        </div>
      )}

      {saved && (
        <p className="text-xs text-green-600 font-medium flex items-center gap-1">
          <Check className="w-3 h-3" /> Saved!
        </p>
      )}
    </div>
  );
}