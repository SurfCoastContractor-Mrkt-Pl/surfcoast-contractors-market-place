import React, { useEffect, useRef } from 'react';

export default function RetroBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Draw Memphis-style 80s geometric background
    const shapes = [];
    const colors = ['#FF1493', '#00FFFF', '#FFD700', '#FF6600', '#7B2FBE', '#00FF41', '#FF69B4', '#1E90FF'];

    // Generate random shapes
    for (let i = 0; i < 60; i++) {
      shapes.push({
        type: Math.floor(Math.random() * 4),
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 30 + 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.25 + 0.05
      });
    }

    ctx.fillStyle = '#0a0020';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
    }

    // Draw shapes
    shapes.forEach(s => {
      ctx.save();
      ctx.globalAlpha = s.opacity;
      ctx.fillStyle = s.color;
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 2;
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rotation);
      if (s.type === 0) {
        ctx.beginPath();
        ctx.moveTo(0, -s.size); ctx.lineTo(s.size, s.size); ctx.lineTo(-s.size, s.size);
        ctx.closePath(); ctx.fill();
      } else if (s.type === 1) {
        ctx.fillRect(-s.size / 2, -s.size / 2, s.size, s.size);
      } else if (s.type === 2) {
        ctx.beginPath(); ctx.arc(0, 0, s.size / 2, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(-s.size, 0); ctx.lineTo(-s.size / 2, -s.size / 2);
        ctx.lineTo(0, 0); ctx.lineTo(s.size / 2, -s.size / 2);
        ctx.lineTo(s.size, 0); ctx.stroke();
      }
      ctx.restore();
    });

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}