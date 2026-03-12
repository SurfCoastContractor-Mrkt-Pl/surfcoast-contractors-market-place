import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PortfolioGalleryViewer({ images = [] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setLightboxOpen(false);
  };

  React.useEffect(() => {
    if (lightboxOpen) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [lightboxOpen, currentIndex, images.length]);

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Portfolio</h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {images.map((url, idx) => (
          <button
            key={idx}
            onClick={() => {
              setCurrentIndex(idx);
              setLightboxOpen(true);
            }}
            className="relative group overflow-hidden rounded-lg aspect-square bg-slate-100"
          >
            <img
              src={url}
              alt={`Portfolio ${idx + 1}`}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <ChevronRight className="w-6 h-6 text-white" />
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          <div className="relative w-full h-full max-w-4xl flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Main Image */}
            <img
              src={images[currentIndex]}
              alt={`Portfolio ${currentIndex + 1}`}
              className="max-w-full max-h-[70vh] object-contain rounded-lg"
            />

            {/* Navigation */}
            {images.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToPrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    goToNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Image Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 rounded-full text-white text-sm">
                  {currentIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="absolute bottom-16 flex gap-2 overflow-x-auto max-w-full px-4 py-2">
                {images.map((url, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentIndex(idx);
                    }}
                    className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden transition-all ${
                      idx === currentIndex ? 'ring-2 ring-white scale-110' : 'opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}