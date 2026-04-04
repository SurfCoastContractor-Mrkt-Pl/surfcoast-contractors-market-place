/**
 * Signature Capture Modal - Mobile Optimized
 * Full-screen canvas on mobile, modal on desktop
 */
import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export default function SignatureCaptureModal({ isOpen, onClose, onSignatureCapture, userName }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (!isOpen || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Set canvas size to full viewport (mobile) or modal size (desktop)
    if (isMobile) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight - 100; // Leave room for buttons
      document.body.style.overflow = 'hidden';
    } else {
      canvas.width = 600;
      canvas.height = 300;
    }

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);

    // Instructions
    ctx.fillStyle = '#9ca3af';
    ctx.font = '14px Inter, sans-serif';
    ctx.fillText('Sign above', 20, 30);

    // Handle drawing
    const handleMouseDown = (e) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      ctx.beginPath();
      ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const handleMouseMove = (e) => {
      if (!isDrawing) return;
      const rect = canvas.getBoundingClientRect();
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.stroke();
    };

    const handleMouseUp = () => {
      setIsDrawing(false);
    };

    // Touch support (mobile)
    const handleTouchStart = (e) => {
      setIsDrawing(true);
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      ctx.beginPath();
      ctx.moveTo(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    const handleTouchMove = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      ctx.strokeStyle = '#111827';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(touch.clientX - rect.left, touch.clientY - rect.top);
      ctx.stroke();
    };

    const handleTouchEnd = () => {
      setIsDrawing(false);
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, isMobile]);

  const handleClear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
  };

  const handleSubmit = () => {
    const signatureUrl = canvasRef.current.toDataURL('image/png');
    onSignatureCapture(signatureUrl);
    onClose();
  };

  if (!isOpen) return null;

  // Mobile: Full screen
  if (isMobile) {
    return (
      <div className="fixed inset-0 bg-black/90 z-50 flex flex-col">
        <div className="flex justify-between items-center p-4 bg-white">
          <h2 className="text-lg font-semibold">{userName}'s Signature</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <canvas
          ref={canvasRef}
          className="flex-1 bg-white cursor-crosshair"
        />

        <div className="flex gap-3 p-4 bg-white">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            Sign
          </Button>
        </div>
      </div>
    );
  }

  // Desktop: Modal
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">{userName}'s Signature</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <canvas
            ref={canvasRef}
            className="w-full border-2 border-gray-300 rounded-lg cursor-crosshair"
          />
        </div>

        <div className="flex gap-3 p-6 border-t">
          <Button
            variant="outline"
            onClick={handleClear}
            className="flex-1"
          >
            Clear
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1"
          >
            Submit Signature
          </Button>
        </div>
      </div>
    </div>
  );
}