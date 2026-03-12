import React from 'react';

export default function BeachThemeHeader({ title, subtitle, backgroundImage }) {
  return (
    <div className="relative bg-white py-24">
      {/* Content */}
      <div className="relative flex flex-col items-center justify-center text-center px-4">
        <div className="mb-6 text-6xl animate-bounce" style={{ animationDuration: '3s' }}>
          🌊
        </div>
        <h1 className="font-serif text-5xl font-bold text-blue-600 mb-4 max-w-3xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-xl text-slate-600 max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}