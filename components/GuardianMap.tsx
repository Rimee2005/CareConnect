'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StarRating } from './StarRating';
import { MapPin, Navigation, AlertCircle } from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';
import { calculateDistance, formatDistance } from '@/lib/utils';

interface Guardian {
  _id: string;
  name: string;
  specialization: string[];
  profilePhoto?: string;
  averageRating?: number;
  reviewCount?: number;
  serviceRadius: number;
  location?: {
    city?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  aiMatch?: {
    isRecommended: boolean;
    explanation: string;
  };
  availability?: {
    days: string[];
  };
}

interface GuardianMapProps {
  guardians: Guardian[];
  vitalLocation?: {
    lat: number;
    lng: number;
  };
  onGuardianClick?: (guardian: Guardian) => void;
}

export function GuardianMap({ guardians, vitalLocation, onGuardianClick }: GuardianMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  // Check if map view is enabled
  if (!featureFlags.MAP_VIEW) {
    return null;
  }

  useEffect(() => {
    if (!mapRef.current || mapError) return;

    const loadMap = async () => {
      try {
        // Use Google Maps by default, fallback to Mapbox
        const mapProvider = process.env.NEXT_PUBLIC_MAP_PROVIDER || 'google';
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

        if (!apiKey) {
          console.warn('Map API key not found. Map view disabled.');
          setMapError(true);
          return;
        }

        if (mapProvider === 'google') {
          await loadGoogleMap(apiKey);
        } else {
          await loadMapboxMap(apiKey);
        }
      } catch (error) {
        console.error('Failed to load map:', error);
        setMapError(true);
      }
    };

    loadMap();
  }, [mapError]);

  const loadGoogleMap = async (apiKey: string) => {
    // Dynamically load Google Maps script
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry`;
      script.async = true;
      script.defer = true;
      script.onload = () => initializeGoogleMap();
      script.onerror = () => setMapError(true);
      document.head.appendChild(script);
    } else {
      initializeGoogleMap();
    }
  };

  const initializeGoogleMap = () => {
    if (!mapRef.current || !window.google) return;

    const center = vitalLocation || { lat: 28.6139, lng: 77.2090 }; // Default to Delhi

    // Extract styles array to avoid parsing issues
    const mapStyles = [
      {
        featureType: 'poi',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
      {
        featureType: 'transit',
        elementType: 'labels',
        stylers: [{ visibility: 'off' }],
      },
    ];

    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 12,
      center,
      styles: mapStyles,
      mapTypeControl: false,
      fullscreenControl: true,
      streetViewControl: false,
    });

    mapInstanceRef.current = map;

    // Add Vital location marker
    if (vitalLocation) {
      new window.google.maps.Marker({
        position: vitalLocation,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#14b8a6',
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2,
        },
        title: 'Your Location',
        zIndex: 1000,
      });
    }

    // Add Guardian markers
    guardians.forEach((guardian) => {
      if (!guardian.location?.coordinates) return;

      const position = {
        lat: guardian.location.coordinates.lat,
        lng: guardian.location.coordinates.lng,
      };

      // Determine marker color based on availability
      const isAvailable = guardian.availability?.days && guardian.availability.days.length > 0;
      const markerColor = isAvailable ? '#22c55e' : '#f59e0b'; // Green for available, Amber for busy

      // Create marker
      const marker = new window.google.maps.Marker({
        position,
        map,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: guardian.aiMatch?.isRecommended ? '#8b5cf6' : markerColor, // Purple for AI-recommended
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: guardian.aiMatch?.isRecommended ? 3 : 2,
        },
        title: guardian.name,
        zIndex: guardian.aiMatch?.isRecommended ? 100 : 10,
      });

      // Add click listener
      marker.addListener('click', () => {
        setSelectedGuardian(guardian);
        map.setCenter(position);
        map.setZoom(14);
      });

      markersRef.current.push(marker);

      // Add service radius circle
      const circle = new window.google.maps.Circle({
        strokeColor: markerColor,
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: markerColor,
        fillOpacity: 0.1,
        map,
        center: position,
        radius: guardian.serviceRadius * 1000, // Convert km to meters
      });

      circlesRef.current.push(circle);
    });

    setMapLoaded(true);
  };

  const loadMapboxMap = async (accessToken: string) => {
    // Mapbox implementation would go here
    // For now, fallback to Google Maps
    setMapError(true);
  };

  const getDistance = (guardian: Guardian): string | null => {
    if (!vitalLocation || !guardian.location?.coordinates) return null;
    const distance = calculateDistance(
      vitalLocation.lat,
      vitalLocation.lng,
      guardian.location.coordinates.lat,
      guardian.location.coordinates.lng
    );
    return formatDistance(distance);
  };

  if (mapError) {
    return (
      <Card className="mb-6">
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-text-muted" />
          <p className="text-text-muted">Map unavailable. Showing nearby care providers.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <Card>
        <CardContent className="p-0">
          <div className="relative">
            <div
              ref={mapRef}
              className="h-96 w-full rounded-lg"
              role="application"
              aria-label="Guardian discovery map"
            />
            {!mapLoaded && (
              <div className="absolute inset-0 flex items-center justify-center bg-background-secondary">
                <p className="text-text-muted">Loading map...</p>
              </div>
            )}

            {/* Guardian Popup */}
            {selectedGuardian && (
              <div className="absolute bottom-4 left-4 right-4 z-10 sm:left-auto sm:right-4 sm:w-80">
                <Card className="shadow-lg">
                  <CardContent className="p-4">
                    <div className="mb-3 flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        {selectedGuardian.profilePhoto ? (
                          <img
                            src={selectedGuardian.profilePhoto}
                            alt={selectedGuardian.name}
                            className="h-12 w-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                            <span className="text-lg font-semibold text-primary">
                              {selectedGuardian.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className="font-semibold">{selectedGuardian.name}</h3>
                          {selectedGuardian.averageRating && (
                            <div className="flex items-center gap-1">
                              <StarRating
                                rating={selectedGuardian.averageRating}
                                readonly
                                size="sm"
                              />
                              <span className="text-xs text-text-muted">
                                ({selectedGuardian.reviewCount || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setSelectedGuardian(null)}
                        className="text-text-muted hover:text-text"
                        aria-label="Close popup"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mb-3 space-y-2">
                      {selectedGuardian.specialization.slice(0, 2).map((spec, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {spec}
                        </Badge>
                      ))}
                    </div>

                    {getDistance(selectedGuardian) && (
                      <div className="mb-3 flex items-center gap-1 text-sm text-text-muted">
                        <MapPin className="h-4 w-4" />
                        <span>{getDistance(selectedGuardian)}</span>
                      </div>
                    )}

                    {selectedGuardian.aiMatch?.isRecommended && (
                      <div className="mb-3 rounded bg-primary/10 p-2 text-xs text-primary">
                        🤖 {selectedGuardian.aiMatch.explanation}
                      </div>
                    )}

                    {onGuardianClick && (
                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => {
                          onGuardianClick(selectedGuardian);
                          setSelectedGuardian(null);
                        }}
                      >
                        View Details
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Extend Window interface for Google Maps
declare global {
  interface Window {
    google: any;
  }
}
