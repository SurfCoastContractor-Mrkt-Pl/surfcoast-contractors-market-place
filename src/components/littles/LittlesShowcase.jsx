import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';
import './littles-showcase.css';

const PolaroidCard = ({ showcase, onLike, userEmail }) => {
  const [isLiked, setIsLiked] = useState(false);
  const primaryPhoto = showcase.photo_urls?.[0];

  const handleLike = async () => {
    setIsLiked(!isLiked);
    if (onLike) {
      onLike(showcase.id, !isLiked);
    }
  };

  return (
    <div className="polaroid-card group">
      {/* Polaroid Frame */}
      <div className="polaroid-frame">
        {/* Image Container */}
        <div className="polaroid-image-container">
          {primaryPhoto ? (
            <img src={primaryPhoto} alt={showcase.title} className="polaroid-image" />
          ) : (
            <div className="polaroid-placeholder">No Image</div>
          )}
        </div>

        {/* Polaroid Bottom Text */}
        <div className="polaroid-bottom">
          <div className="polaroid-text">
            <p className="polaroid-title">{showcase.title}</p>
            <p className="polaroid-subtitle">{showcase.child_name}, age {showcase.child_age || '?'}</p>
          </div>
        </div>
      </div>

      {/* Hover Info & Like */}
      <div className="polaroid-hover-overlay">
        <div className="polaroid-hover-content">
          <p className="text-sm text-white font-medium mb-3">{showcase.description}</p>
          {showcase.photo_urls?.length > 1 && (
            <p className="text-xs text-white/80 mb-3">+{showcase.photo_urls.length - 1} more photos</p>
          )}
          <button
            onClick={handleLike}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-lg transition-colors backdrop-blur-sm"
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{showcase.likes_count + (isLiked ? 1 : 0)}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default function LittlesShowcase() {
  const [userEmail, setUserEmail] = useState(null);

  useEffect(() => {
    const getUser = async () => {
      try {
        const user = await base44.auth.me();
        if (user) {
          setUserEmail(user.email);
        }
      } catch (error) {
        console.log('Not authenticated');
      }
    };
    getUser();
  }, []);

  const { data: showcases = [], isLoading } = useQuery({
    queryKey: ['littlesShowcase'],
    queryFn: async () => {
      const result = await base44.entities.LittlesShowcase.filter(
        { is_active: true },
        '-created_date',
        100
      );
      return result || [];
    }
  });

  if (isLoading) {
    return (
      <div className="w-full py-16 text-center">
        <div className="inline-block animate-spin">📸</div>
      </div>
    );
  }

  if (showcases.length === 0) {
    return (
      <div className="w-full py-16 text-center text-slate-600">
        <p>No showcases yet. Be the first to share! 🎨</p>
      </div>
    );
  }

  // Split showcases into rows and alternate direction
  const rows = [];
  const itemsPerRow = 6;
  for (let i = 0; i < showcases.length; i += itemsPerRow) {
    rows.push(showcases.slice(i, i + itemsPerRow));
  }

  return (
    <div className="w-full py-12 overflow-hidden">
      <div className="space-y-12">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className={`flex gap-4 px-4 ${
              rowIndex % 2 === 0 ? 'littles-scroll-left' : 'littles-scroll-right'
            }`}
          >
            {/* Duplicate items for seamless loop */}
            {[...row, ...row].map((showcase, itemIndex) => (
              <div key={`${rowIndex}-${itemIndex}`} className="flex-shrink-0">
                <PolaroidCard
                  showcase={showcase}
                  userEmail={userEmail}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}