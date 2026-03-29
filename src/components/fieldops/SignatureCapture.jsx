import React, { useRef } from 'react';
import { RotateCcw, Send } from 'lucide-react';

export default function SignatureCapture({ onCapture, disabled = false }) {
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const startDrawing = (e) => {
    if (disabled) return;
    isDrawingRef.current = true;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();
  };

  const draw = (e) => {
    if (!isDrawingRef.current || disabled) return;
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onCapture(dataUrl);
    clearCanvas();
  };

  const isEmpty = () => {
    const canvas = canvasRef.current;
    return !canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some(bit => bit !== 0);
  };

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <p className="text-white font-semibold mb-3">Digital Signature</p>
      <canvas
        ref={canvasRef}
        width={300}
        height={150}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full border-2 border-slate-700 rounded-xl bg-slate-800 cursor-crosshair touch-none"
      />
      <div className="flex gap-2 mt-3">
        <button
          onClick={clearCanvas}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 text-sm"
        >
          <RotateCcw className="w-4 h-4" />
          Clear
        </button>
        <button
          onClick={handleSubmit}
          disabled={isEmpty() || disabled}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 disabled:opacity-50 text-white rounded-lg text-sm font-semibold"
        >
          <Send className="w-4 h-4" />
          Submit
        </button>
      </div>
    </div>
  );
}