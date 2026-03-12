import React from 'react';

export default function BeachThemeHeader({ title, subtitle, backgroundImage }) {
  return (
    <div className="relative h-80 overflow-hidden">
      {/* Background image with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          filter: 'brightness(0.7)'
        }}
      ></div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/40 to-slate-900/80"></div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
        <div className="mb-6 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>
          🌊
        </div>
        <h1 className="font-serif text-5xl font-bold text-white mb-4 max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-slate-100 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {/* Subtle wave pattern at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-20 opacity-30">
        <svg viewBox="0 0 1200 120" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,64 Q300,20 600,64 T1200,64 L1200,120 L0,120 Z" fill="#0ea5e9"/>
        </svg>
      </div>
    </div>
  );
}