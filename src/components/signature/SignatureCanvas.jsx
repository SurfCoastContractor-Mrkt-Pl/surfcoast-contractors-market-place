import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw, Download } from 'lucide-react';

export default function SignatureCanvas({ onSignatureCapture, disabled = false }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;

      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  const startDrawing = (e) => {
    if (disabled) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const x = e.clientX - rect.left || e.touches?.[0]?.clientX - rect.left;
    const y = e.clientY - rect.top || e.touches?.[0]?.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e) => {
    if (!isDrawing || disabled) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');

    const x = e.clientX - rect.left || e.touches?.[0]?.clientX - rect.left;
    const y = e.clientY - rect.top || e.touches?.[0]?.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.closePath();

    setIsDrawing(false);
    setHasSignature(true);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    onSignatureCapture(null);
  };

  const captureSignature = async () => {
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSignatureCapture(dataUrl);
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-700">Sign Here *</div>
      
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className={`w-full border-2 rounded-lg cursor-crosshair bg-white ${
          disabled
            ? 'border-slate-200 opacity-50 cursor-not-allowed'
            : 'border-slate-300 hover:border-blue-400'
        }`}
        style={{ height: '120px', touchAction: 'none' }}
      />

      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearSignature}
          disabled={!hasSignature || disabled}
          className="gap-1"
        >
          <RotateCcw className="w-3 h-3" />
          Clear
        </Button>

        {hasSignature && (
          <div className="text-xs text-green-600 font-medium">
            ✓ Signature captured
          </div>
        )}

        <Button
          type="button"
          size="sm"
          onClick={captureSignature}
          disabled={!hasSignature || disabled}
          className="bg-blue-600 hover:bg-blue-700 text-white gap-1"
        >
          <Download className="w-3 h-3" />
          Confirm Signature
        </Button>
      </div>
    </div>
  );
}