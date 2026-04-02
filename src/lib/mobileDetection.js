// Mobile app detection and bridging
export const isMobileApp = () => {
  return window.ReactNativeWebView || window.mobileApp;
};

export const mobileBridge = {
  openCamera: (callback) => {
    if (window.mobileApp?.openCamera) {
      window.mobileApp.openCamera(callback);
    } else {
      console.warn('Mobile camera not available');
    }
  },

  openGallery: (callback) => {
    if (window.mobileApp?.openGallery) {
      window.mobileApp.openGallery(callback);
    }
  },

  getGPSLocation: (callback) => {
    if (window.mobileApp?.getGPSLocation) {
      window.mobileApp.getGPSLocation(callback);
    } else {
      navigator.geolocation.getCurrentPosition(
        (pos) => callback(null, pos),
        (err) => callback(err)
      );
    }
  },

  sendPushNotification: (title, body) => {
    if (window.mobileApp?.sendNotification) {
      window.mobileApp.sendNotification(title, body);
    }
  },

  getDeviceId: () => {
    return window.mobileApp?.deviceId || 'web-' + Math.random().toString(36);
  },

  openSettings: () => {
    if (window.mobileApp?.openSettings) {
      window.mobileApp.openSettings();
    }
  },
};

export const requestMobilePermissions = async (permission) => {
  if (window.mobileApp?.requestPermission) {
    return window.mobileApp.requestPermission(permission);
  }
  // Web fallback
  if (permission === 'camera') {
    return navigator.mediaDevices.getUserMedia({ video: true });
  }
  if (permission === 'location') {
    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });
  }
};