import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Heart } from 'lucide-react';

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

const styles = `
  .polaroid-card {
    width: 240px;
    flex-shrink: 0;
    perspective: 1000px;
    cursor: pointer;
  }

  .polaroid-frame {
    background: #ffffff;
    padding: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
    transform: rotate(var(--rotation, -2deg));
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    position: relative;
  }

  .polaroid-card:nth-child(1n) .polaroid-frame {
    --rotation: -2deg;
  }

  .polaroid-card:nth-child(2n) .polaroid-frame {
    --rotation: 1deg;
  }

  .polaroid-card:nth-child(3n) .polaroid-frame {
    --rotation: -1.5deg;
  }

  .polaroid-card:nth-child(4n) .polaroid-frame {
    --rotation: 2deg;
  }

  .polaroid-card:nth-child(5n) .polaroid-frame {
    --rotation: -0.5deg;
  }

  .polaroid-card:hover .polaroid-frame {
    transform: rotate(var(--rotation)) scale(1.05);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
  }

  .polaroid-image-container {
    width: 100%;
    height: 180px;
    overflow: hidden;
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
  }

  .polaroid-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .polaroid-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f0f0f0, #e0e0e0);
    color: #999;
    font-size: 14px;
  }

  .polaroid-bottom {
    background: #f9f9f9;
    padding: 12px;
    min-height: 50px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .polaroid-text {
    font-family: 'Marker Felt', 'Comic Sans MS', cursive;
  }

  .polaroid-title {
    font-size: 14px;
    font-weight: 600;
    color: #333;
    margin: 0;
    word-break: break-word;
  }

  .polaroid-subtitle {
    font-size: 12px;
    color: #666;
    margin: 2px 0 0 0;
    font-style: italic;
  }

  .polaroid-hover-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5));
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    align-items: flex-end;
    padding: 16px;
    border-radius: 0;
  }

  .polaroid-card:hover .polaroid-hover-overlay {
    opacity: 1;
  }

  .polaroid-hover-content {
    width: 100%;
  }

  @keyframes scroll-left {
    0% {
      transform: translateX(0);
    }
    100% {
      transform: translateX(-50%);
    }
  }

  @keyframes scroll-right {
    0% {
      transform: translateX(-50%);
    }
    100% {
      transform: translateX(0);
    }
  }

  .littles-scroll-left {
    animation: scroll-left 40s linear infinite;
    display: flex;
    gap: 1rem;
  }

  .littles-scroll-right {
    animation: scroll-right 40s linear infinite;
    display: flex;
    gap: 1rem;
  }

  .littles-scroll-left:hover,
  .littles-scroll-right:hover {
    animation-play-state: paused;
  }

  @media (max-width: 768px) {
    .polaroid-card {
      width: 160px;
    }

    .polaroid-image-container {
      height: 120px;
    }

    .polaroid-bottom {
      padding: 8px;
      min-height: 40px;
    }

    .polaroid-title {
      font-size: 12px;
    }

    .polaroid-subtitle {
      font-size: 10px;
    }
  }
`;

export default function LittlesShowcase() {
  const [userEmail, setUserEmail] = useState(null);

  // Littles showcase component
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
    <>
      <style>{styles}</style>
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
    </>
  );
}