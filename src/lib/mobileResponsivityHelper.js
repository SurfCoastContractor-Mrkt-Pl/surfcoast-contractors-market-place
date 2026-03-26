// Mobile responsivity helper for detecting and handling edge cases
// Ensures payments and forms work across all device sizes

export const Breakpoints = {
  MOBILE_SMALL: 320,   // Old iPhones
  MOBILE_MEDIUM: 375,  // iPhone 6/7/8
  MOBILE_LARGE: 425,   // Larger phones
  TABLET: 768,         // iPad
  DESKTOP: 1024
};

export function getDeviceType(width = window.innerWidth) {
  if (width < Breakpoints.MOBILE_LARGE) return 'mobile-small';
  if (width < Breakpoints.TABLET) return 'mobile-large';
  if (width < Breakpoints.DESKTOP) return 'tablet';
  return 'desktop';
}

export function isSmallScreen() {
  return window.innerWidth < Breakpoints.MOBILE_LARGE;
}

export function isPortrait() {
  return window.innerHeight > window.innerWidth;
}

// Form input helper for mobile
export const MobileFormHelper = {
  // Disable zoom on input focus (prevents iOS scroll issues)
  preventZoom: () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
    }
  },

  // Ensure minimum touch target size (44x44px)
  ensureMinimumTouchTarget: (element) => {
    const style = window.getComputedStyle(element);
    const height = parseFloat(style.height);
    const width = parseFloat(style.width);

    if (height < 44 || width < 44) {
      element.style.minHeight = '44px';
      element.style.minWidth = '44px';
      element.style.padding = '10px';
    }
  },

  // Handle keyboard appearance on iOS (payment forms)
  handleKeyboardAppearance: () => {
    let scrollPosition = 0;
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
      input.addEventListener('focus', () => {
        scrollPosition = window.scrollY;
      });

      input.addEventListener('blur', () => {
        // Restore scroll position after keyboard hides
        setTimeout(() => {
          window.scrollTo(0, scrollPosition);
        }, 100);
      });
    });
  },

  // Safe payment form rendering
  renderPaymentFormSafely: (formElement) => {
    if (!formElement) return;

    // Ensure form doesn't exceed viewport width
    formElement.style.maxWidth = '100vw';
    formElement.style.overflowX = 'hidden';

    // Add safe padding for notches (iPhone X+)
    formElement.style.paddingLeft = 'max(1rem, env(safe-area-inset-left))';
    formElement.style.paddingRight = 'max(1rem, env(safe-area-inset-right))';
    formElement.style.paddingBottom = 'max(1rem, env(safe-area-inset-bottom))';

    // Ensure submit button is always accessible
    const submitButton = formElement.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.style.minHeight = '44px';
      submitButton.style.minWidth = '100%';
    }
  }
};

// Viewport listener for responsive adjustments
export function watchViewportChanges(callback) {
  let resizeTimer;
  
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      callback({
        width: window.innerWidth,
        height: window.innerHeight,
        deviceType: getDeviceType(),
        isPortrait: isPortrait()
      });
    }, 100);
  });

  return () => window.removeEventListener('resize', callback);
}

// Check if running in iframe (prevents payment checkout in preview)
export function isIframeContext() {
  try {
    return window.self !== window.top;
  } catch {
    return true; // Assume iframe if error (cross-origin)
  }
}

export function blockCheckoutInIframe(checkoutFn) {
  return () => {
    if (isIframeContext()) {
      alert('Checkout is not available in preview mode. Please use the published app to complete your purchase.');
      return;
    }
    return checkoutFn();
  };
}