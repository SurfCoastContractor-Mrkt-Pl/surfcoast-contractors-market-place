import { useState, useCallback, useRef, useEffect } from 'react';

export function useGpsTracking() {
  const [location, setLocation] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [accuracy, setAccuracy] = useState(null);
  const [error, setError] = useState(null);
  const watchRef = useRef(null);

  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    setTracking(true);
    watchRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setLocation({ latitude, longitude, timestamp: new Date().toISOString() });
        setAccuracy(Math.round(accuracy));
        setError(null);
      },
      (err) => {
        setError(err.message);
        setTracking(false);
      },
      { 
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }, []);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      navigator.geolocation.clearWatch(watchRef.current);
      watchRef.current = null;
    }
    setTracking(false);
  }, []);

  useEffect(() => {
    return () => {
      if (watchRef.current) {
        navigator.geolocation.clearWatch(watchRef.current);
      }
    };
  }, []);

  return { location, tracking, accuracy, error, startTracking, stopTracking };
}