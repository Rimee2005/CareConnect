'use client';

import { useState, useEffect } from 'react';

// India-level default center
const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

interface GeolocationState {
  position: [number, number] | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Check if geolocation is supported
    if (!navigator.geolocation) {
      setState({
        position: DEFAULT_CENTER,
        loading: false,
        error: 'Geolocation is not supported by your browser',
      });
      return;
    }

    // Try to get current position
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          position: [position.coords.latitude, position.coords.longitude],
          loading: false,
          error: null,
        });
      },
      (error) => {
        // Permission denied or other error - use fallback
        console.warn('Geolocation error:', error.message);
        setState({
          position: DEFAULT_CENTER,
          loading: false,
          error: error.message,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  return state;
}
