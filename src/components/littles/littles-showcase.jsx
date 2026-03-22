/* Polaroid Card Styling */
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

/* Image Container */
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

/* Polaroid Bottom Text */
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

/* Hover Overlay */
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

/* Scrolling Animations */
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

/* Pause animation on hover */
.littles-scroll-left:hover,
.littles-scroll-right:hover {
  animation-play-state: paused;
}

/* Responsive adjustments */
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