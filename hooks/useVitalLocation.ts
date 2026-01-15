'use client';

import { useState, useEffect, useCallback } from 'react';

interface Location {
  lat: number;
  lng: number;
}

/**
 * Shared hook for managing Vital user location and radius across all pages
 * Provides consistent location state and location request functionality
 */
export function useVitalLocation() {
  const [vitalLocation, setVitalLocation] = useState<Location | undefined>();
  const [mapRadius, setMapRadius] = useState(10); // Default 10km
  const [locationPermissionRequested, setLocationPermissionRequested] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch location from profile
  const fetchVitalLocation = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/vital/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.location?.coordinates) {
          setVitalLocation({
            lat: data.location.coordinates.lat,
            lng: data.location.coordinates.lng,
          });
          setLoading(false);
          return;
        }
      }
      // If no location in profile, try to get current location
      requestCurrentLocation();
    } catch (error) {
      console.error('Failed to fetch vital location:', error);
      setLoading(false);
    }
  }, []);

  // Request current location from browser
  const requestCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      console.warn('Geolocation is not supported by your browser.');
      setLoading(false);
      return;
    }

    setLocationPermissionRequested(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setVitalLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (error) => {
        console.log('Location permission denied or unavailable:', error);
        setLoading(false);
        setLocationPermissionRequested(false); // Allow retry
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  // Initialize location on mount
  useEffect(() => {
    fetchVitalLocation();
  }, [fetchVitalLocation]);

  return {
    vitalLocation,
    mapRadius,
    setMapRadius,
    locationPermissionRequested,
    loading,
    requestCurrentLocation,
    fetchVitalLocation,
  };
}

