'use client';

import { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { StarRating } from './StarRating';
import { MapPin, Navigation, AlertCircle, ChevronDown, ChevronUp, X } from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';
import { calculateDistance, formatDistance } from '@/lib/utils';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
// Using 'as any' to work around TypeScript issues with dynamic imports
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false }) as any;
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false }) as any;
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false }) as any;
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false }) as any;
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false }) as any;

// Component to handle map bounds changes - must be inside MapContainer
// This component uses useMap hook which can only be used inside MapContainer
const MapBoundsHandlerInternal = dynamic(
  () => {
    return Promise.all([
      import('react-leaflet'),
      import('react')
    ]).then(([leafletMod, reactMod]) => {
      const { useMap } = leafletMod;
      const { useEffect } = reactMod;
      
      interface MapBoundsHandlerProps {
        onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
        mapRef: { current: any };
      }
      
      return function MapBoundsHandlerInternal({ 
        onBoundsChange, 
        mapRef 
      }: MapBoundsHandlerProps) {
        const map = useMap();
        
        useEffect(() => {
          mapRef.current = map;
          
          const updateBounds = () => {
            try {
              const bounds = map.getBounds();
              onBoundsChange({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest(),
              });
            } catch (error) {
              console.error('Error getting map bounds:', error);
            }
          };
          
          // Initial bounds update
          updateBounds();
          
          map.on('moveend', updateBounds);
          map.on('zoomend', updateBounds);
          
          return () => {
            map.off('moveend', updateBounds);
            map.off('zoomend', updateBounds);
          };
          // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [map]);
        
        return null;
      };
    });
  },
  { ssr: false }
);

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

interface LeafletMapProps {
  guardians: Guardian[];
  vitalLocation?: {
    lat: number;
    lng: number;
  };
  onGuardianClick?: (guardian: Guardian) => void;
  onMapBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  radius?: number;
  onRadiusChange?: (radius: number) => void;
  onLocationRequest?: () => void;
}


export function LeafletMap({ 
  guardians, 
  vitalLocation, 
  onGuardianClick, onMapBoundsChange, 
  radius = 10, 
  onRadiusChange, 
  onLocationRequest 
}: LeafletMapProps) {
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const mapRef = useRef<any>(null);
  const vitalIconRef = useRef<any>(null);
  const guardianIconsRef = useRef<Map<string, any>>(new Map());

  // Check if map view is enabled
  if (!featureFlags.MAP_VIEW) {
    return null;
  }

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect mobile
  useEffect(() => {
    if (!mounted) return;
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsCollapsed(false);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [mounted]);

  // Load Leaflet icon fix and create custom icons
  useEffect(() => {
    if (!mounted) return;
    
    const loadLeafletIcons = async () => {
      try {
        const L = await import('leaflet');
        
        // Fix for default marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        // Create vital location icon
        vitalIconRef.current = L.divIcon({
          className: 'vital-location-marker',
          html: `<div style="
            width: 16px;
            height: 16px;
            background-color: #14b8a6;
            border: 2px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        
        setMapLoaded(true);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        setMapError(true);
      }
    };
    
    loadLeafletIcons();
  }, [mounted]);

  // Create guardian icons when guardians change
  useEffect(() => {
    if (!mapLoaded) return;
    
    const createGuardianIcons = async () => {
      try {
        const L = await import('leaflet');
        guardianIconsRef.current.clear();
        
        guardians.forEach((guardian) => {
          if (!guardian.location?.coordinates) return;
          // Get marker color inline to avoid dependency issues
          const markerColor = guardian.aiMatch?.isRecommended 
            ? '#8b5cf6' 
            : (guardian.availability?.days && guardian.availability.days.length > 0)
              ? '#22c55e'
              : '#f59e0b';
          const isRecommended = guardian.aiMatch?.isRecommended || false;
          
          guardianIconsRef.current.set(guardian._id, L.divIcon({
            className: 'guardian-marker',
            html: `<div style="
              width: ${isRecommended ? '24px' : '20px'};
              height: ${isRecommended ? '24px' : '20px'};
              background-color: ${markerColor};
              border: ${isRecommended ? '3px' : '2px'} solid white;
              border-radius: 50%;
              box-shadow: 0 2px 8px rgba(0,0,0,0.3);
              cursor: pointer;
            "></div>`,
            iconSize: [isRecommended ? 24 : 20, isRecommended ? 24 : 20],
            iconAnchor: [isRecommended ? 12 : 10, isRecommended ? 12 : 10],
          }));
        });
      } catch (error) {
        console.error('Failed to create guardian icons:', error);
      }
    };
    
    createGuardianIcons();
  }, [guardians, mapLoaded]);

  // Determine map center - Use vitalLocation, or first guardian's location, or default to Delhi
  // This ensures the map renders even without location data
  const mapCenter: [number, number] = vitalLocation 
    ? [vitalLocation.lat, vitalLocation.lng]
    : (guardians.length > 0 && guardians[0].location?.coordinates)
      ? [guardians[0].location.coordinates.lat, guardians[0].location.coordinates.lng]
      : [28.6139, 77.2090]; // Fixed: Delhi coordinates for testing

  // Calculate zoom based on radius
  const mapZoom = radius <= 2 ? 14 : radius <= 5 ? 13 : 12;
  
  // Debug: Log map state for troubleshooting
  useEffect(() => {
    if (mounted) {
      console.log('[LeafletMap] Debug State:', {
        mounted,
        mapLoaded,
        mapError,
        mapCenter,
        mapZoom,
        guardiansCount: guardians.length,
        hasVitalLocation: !!vitalLocation,
        featureFlags_MAP_VIEW: featureFlags.MAP_VIEW,
        isMobile,
        isCollapsed,
        vitalIconReady: !!vitalIconRef.current
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, mapLoaded, mapError, mapZoom, guardians.length, isMobile, isCollapsed]);

  // Get distance for a guardian
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

  // Get marker color based on guardian status
  const getMarkerColor = (guardian: Guardian): string => {
    if (guardian.aiMatch?.isRecommended) return '#8b5cf6'; // Purple for AI-recommended
    const isAvailable = guardian.availability?.days && guardian.availability.days.length > 0;
    return isAvailable ? '#22c55e' : '#f59e0b'; // Green for available, Amber for busy
  };

  // Create custom icon
  const createCustomIcon = async (color: string, isRecommended: boolean = false) => {
    const L = await import('leaflet');
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: ${isRecommended ? '24px' : '20px'};
        height: ${isRecommended ? '24px' : '20px'};
        background-color: ${color};
        border: ${isRecommended ? '3px' : '2px'} solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
      "></div>`,
      iconSize: [isRecommended ? 24 : 20, isRecommended ? 24 : 20],
      iconAnchor: [isRecommended ? 12 : 10, isRecommended ? 12 : 10],
    });
  };

  // Show error state only if there's an actual error
  if (mapError) {
    return (
      <Card className="mb-6 border-border dark:border-border-dark">
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-text-muted dark:text-text-dark-muted" />
          <p className="text-sm text-text-muted dark:text-text-dark-muted">
            Map unavailable. Showing nearby care providers in list view.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  // Don't render anything until mounted (prevents SSR issues)
  if (!mounted) {
    return (
      <Card className="mb-6 border-border dark:border-border-dark">
        <CardContent className="py-8 text-center">
          <p className="text-sm text-text-muted dark:text-text-dark-muted">Loading map...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-6">
      <Card className="border-border dark:border-border-dark shadow-soft dark:shadow-dark-soft">
        <CardContent className="p-0">
          {/* Map Header with Controls */}
          <div className="flex items-center justify-between border-b border-border dark:border-border-dark p-3 sm:p-4">
            <div className="flex items-center gap-3">
              <h3 className="text-sm font-semibold text-text dark:text-text-dark sm:text-base">Map View</h3>
              {guardians.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {guardians.length} {guardians.length === 1 ? 'guardian' : 'guardians'}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Location Request Button */}
              {!vitalLocation && onLocationRequest && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onLocationRequest}
                  className="text-xs sm:text-sm h-8"
                  aria-label="Use current location"
                >
                  <Navigation className="h-3 w-3 mr-1" />
                  Use Location
                </Button>
              )}
              {/* Radius Selector */}
              {vitalLocation && onRadiusChange && (
                <select
                  value={radius}
                  onChange={(e) => onRadiusChange(Number(e.target.value))}
                  className="text-xs sm:text-sm rounded-md border border-border dark:border-border-dark bg-background dark:bg-background-dark-secondary px-2 py-1 text-text dark:text-text-dark focus:outline-none focus:ring-2 focus:ring-primary dark:focus:ring-primary-dark-mode"
                  aria-label="Select search radius"
                >
                  <option value="2">2 km</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                </select>
              )}
              {/* Mobile Collapse Toggle */}
              {isMobile && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="h-8 w-8 p-0"
                  aria-label={isCollapsed ? 'Expand map' : 'Collapse map'}
                >
                  {isCollapsed ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronUp className="h-4 w-4" />
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Map Container - Always render when not collapsed, even if icons not ready */}
          {(!isMobile || !isCollapsed) && (
            <div className="relative">
              {/* Loading overlay */}
              {!mapLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-background-secondary dark:bg-background-dark-secondary z-10 rounded-b-lg">
                  <div className="text-center">
                    <p className="text-text-muted dark:text-text-dark-muted mb-2">Loading map...</p>
                    <p className="text-xs text-text-muted dark:text-text-dark-muted">Initializing Leaflet...</p>
                  </div>
                </div>
              )}
              
              {/* Map container with explicit dimensions */}
              <div 
                className="h-64 w-full sm:h-96 rounded-b-lg overflow-hidden"
                style={{ 
                  minHeight: '256px',
                  height: isMobile ? '256px' : '384px',
                  width: '100%',
                  position: 'relative',
                  zIndex: 0
                }}
              >
                {mapLoaded ? (
                  <MapContainer
                    center={mapCenter}
                    zoom={mapZoom}
                    style={{ 
                      height: '100%', 
                      width: '100%', 
                      zIndex: 0,
                      minHeight: '256px'
                    }}
                    className="rounded-b-lg"
                    scrollWheelZoom={true}
                    key={`${mapCenter[0]}-${mapCenter[1]}-${mapZoom}`}
                  >
                  {/* OpenStreetMap Tile Layer */}
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Map Bounds Handler */}
                  {onMapBoundsChange && (
                    <MapBoundsHandlerInternal onBoundsChange={onMapBoundsChange} mapRef={mapRef} />
                  )}

                  {/* Vital Location Marker */}
                  {vitalLocation && (
                    <>
                      <Marker
                        position={[vitalLocation.lat, vitalLocation.lng]}
                        icon={vitalIconRef.current || undefined}
                      >
                        <Popup>
                          <div className="text-sm font-semibold">Your Location</div>
                        </Popup>
                      </Marker>

                      {/* Radius Circle around Vital */}
                      <Circle
                        center={[vitalLocation.lat, vitalLocation.lng]}
                        radius={radius * 1000} // Convert km to meters
                        pathOptions={{
                          color: '#14b8a6',
                          fillColor: '#14b8a6',
                          fillOpacity: 0.1,
                          weight: 2,
                          opacity: 0.4,
                        }}
                      />
                    </>
                  )}

                  {/* Guardian Markers */}
                  {guardians.map((guardian) => {
                    if (!guardian.location?.coordinates) return null;
                    
                    const position: [number, number] = [
                      guardian.location.coordinates.lat,
                      guardian.location.coordinates.lng,
                    ];
                    const markerColor = getMarkerColor(guardian);
                    const isRecommended = guardian.aiMatch?.isRecommended || false;
                    const icon = guardianIconsRef.current.get(guardian._id);

                    // Skip rendering marker if icon not ready
                    if (!icon) return null;

                    return (
                      <div key={guardian._id}>
                        <Marker
                          position={position}
                          icon={icon}
                          eventHandlers={{
                            click: () => {
                              setSelectedGuardian(guardian);
                            },
                          }}
                        >
                          <Popup className="guardian-popup">
                            <div className="min-w-[200px] sm:min-w-[250px]">
                              <div className="mb-2 flex items-center gap-2">
                                {guardian.profilePhoto ? (
                                  <img
                                    src={guardian.profilePhoto}
                                    alt={guardian.name}
                                    className="h-10 w-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                                    <span className="text-sm font-semibold text-primary dark:text-primary-dark-mode">
                                      {guardian.name.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                )}
                                <div className="flex-1">
                                  <h4 className="text-sm font-semibold text-text dark:text-text-dark">{guardian.name}</h4>
                                  {guardian.averageRating && (
                                    <div className="flex items-center gap-1">
                                      <StarRating
                                        rating={guardian.averageRating}
                                        readonly
                                        size="sm"
                                      />
                                      <span className="text-xs text-text-muted dark:text-text-dark-muted">
                                        ({guardian.reviewCount || 0})
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="mb-2 flex flex-wrap gap-1">
                                {guardian.specialization.slice(0, 2).map((spec, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {spec}
                                  </Badge>
                                ))}
                              </div>
                              {getDistance(guardian) && (
                                <div className="mb-2 flex items-center gap-1 text-xs text-text-muted dark:text-text-dark-muted">
                                  <MapPin className="h-3 w-3" />
                                  <span>{getDistance(guardian)}</span>
                                </div>
                              )}
                              {guardian.aiMatch?.isRecommended && (
                                <div className="mb-2 rounded bg-primary/10 dark:bg-primary-dark-mode/20 p-1.5 text-xs text-primary dark:text-primary-dark-mode">
                                  🤖 {guardian.aiMatch.explanation}
                                </div>
                              )}
                              {onGuardianClick && (
                                <Button
                                  className="w-full mt-2"
                                  size="sm"
                                  onClick={() => {
                                    onGuardianClick(guardian);
                                    setSelectedGuardian(null);
                                  }}
                                >
                                  View Details
                                </Button>
                              )}
                            </div>
                          </Popup>
                        </Marker>

                        {/* Service Radius Circle */}
                        <Circle
                          center={position}
                          radius={guardian.serviceRadius * 1000} // Convert km to meters
                          pathOptions={{
                            color: markerColor,
                            fillColor: markerColor,
                            fillOpacity: 0.1,
                            weight: 1,
                            opacity: 0.3,
                          }}
                        />
                      </div>
                    );
                  })}
                  </MapContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-b-lg">
                    <div className="text-center">
                      <p className="text-text-muted dark:text-text-dark-muted mb-2">Preparing map...</p>
                      <p className="text-xs text-text-muted dark:text-text-dark-muted">Loading Leaflet library</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Guardian Popup Card (for mobile) */}
              {selectedGuardian && isMobile && (
                <div className="absolute bottom-4 left-4 right-4 z-[1000]">
                  <Card className="shadow-lg border-border dark:border-border-dark bg-background dark:bg-background-dark">
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
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 dark:bg-primary-dark-mode/20">
                              <span className="text-lg font-semibold text-primary dark:text-primary-dark-mode">
                                {selectedGuardian.name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div>
                            <h3 className="font-semibold text-text dark:text-text-dark">{selectedGuardian.name}</h3>
                            {selectedGuardian.averageRating && (
                              <div className="flex items-center gap-1">
                                <StarRating
                                  rating={selectedGuardian.averageRating}
                                  readonly
                                  size="sm"
                                />
                                <span className="text-xs text-text-muted dark:text-text-dark-muted">
                                  ({selectedGuardian.reviewCount || 0})
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedGuardian(null)}
                          className="text-text-muted dark:text-text-dark-muted hover:text-text dark:hover:text-text-dark transition-colors"
                          aria-label="Close popup"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mb-3 flex flex-wrap gap-1">
                        {selectedGuardian.specialization.slice(0, 2).map((spec, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>

                      {getDistance(selectedGuardian) && (
                        <div className="mb-3 flex items-center gap-1 text-sm text-text-muted dark:text-text-dark-muted">
                          <MapPin className="h-4 w-4" />
                          <span>{getDistance(selectedGuardian)}</span>
                        </div>
                      )}

                      {selectedGuardian.aiMatch?.isRecommended && (
                        <div className="mb-3 rounded bg-primary/10 dark:bg-primary-dark-mode/20 p-2 text-xs text-primary dark:text-primary-dark-mode">
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
          )}

          {!mapLoaded && (!isMobile || !isCollapsed) && (
            <div className="h-64 sm:h-96 flex items-center justify-center bg-background-secondary dark:bg-background-dark-secondary rounded-b-lg">
              <p className="text-sm text-text-muted dark:text-text-dark-muted">Loading map...</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
