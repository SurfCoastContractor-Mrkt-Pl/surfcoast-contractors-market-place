import React from 'react';

/**
 * Lazy Loading Helper
 * Ensures all images use lazy loading for performance
 */

/**
 * Add loading="lazy" to all img tags in a container
 * @param {HTMLElement} container - Container to scan
 */
export const enableLazyLoading = (container = document) => {
  const images = container.querySelectorAll('img');
  images.forEach(img => {
    if (!img.getAttribute('loading')) {
      img.setAttribute('loading', 'lazy');
    }
  });
};

/**
 * Intersection Observer-based lazy loading for older browsers
 * @param {HTMLElement} element - Image element
 */
export const observeLazyImage = (element) => {
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src || img.src;
          img.classList.remove('lazy');
          observer.unobserve(img);
        }
      });
    });
    observer.observe(element);
  }
};

/**
 * React component hook for lazy images
 */
export const useLazyImages = (containerRef) => {
  React.useEffect(() => {
    if (containerRef?.current) {
      enableLazyLoading(containerRef.current);
    }
  }, [containerRef]);
};