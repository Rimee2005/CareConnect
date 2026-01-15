'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from './ui/card';
import { AlertCircle } from 'lucide-react';
import { featureFlags } from '@/lib/feature-flags';
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false }) as any;
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false }) as any;
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false }) as any;
const Circle = dynamic(() => import('react-leaflet').then(mod => mod.Circle), { ssr: false }) as any;

interface GuardianLocationMapProps {
  location: {
    lat: number;
    lng: number;
  };
  serviceRadius: number;
  city?: string;
}

export function GuardianLocationMap({ location, serviceRadius, city }: GuardianLocationMapProps) {
  const [mounted, setMounted] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);
  const markerIconRef = useRef<any>(null);

  // Check if map view is enabled
  if (!featureFlags.MAP_VIEW) {
    return null;
  }

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load Leaflet and create marker icon
  useEffect(() => {
    if (!mounted) return;
    
    const loadMap = async () => {
      try {
        const L = await import('leaflet');
        
        // Fix for default marker icons in Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        });
        
        // Create guardian location marker icon
        markerIconRef.current = L.divIcon({
          className: 'guardian-location-marker',
          html: `<div style="
            width: 20px;
            height: 20px;
            background-color: #14b8a6;
            border: 3px solid white;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>`,
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });
        
        setMapLoaded(true);
      } catch (error) {
        console.error('Failed to load Leaflet:', error);
        setMapError(true);
      }
    };
    
    loadMap();
  }, [mounted]);

  if (mapError) {
    return (
      <Card className="mb-6 border-border dark:border-border-dark">
        <CardContent className="py-8 text-center">
          <AlertCircle className="mx-auto mb-2 h-8 w-8 text-text-muted dark:text-text-dark-muted" />
          <p className="text-sm text-text-muted dark:text-text-dark-muted">
            Map unavailable. Please check your internet connection.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!mounted || !mapLoaded) {
    return (
      <div className="h-64 w-full sm:h-96 rounded-b-lg bg-background-secondary dark:bg-background-dark-secondary flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-text-muted dark:text-text-dark-muted mb-2">Loading map...</p>
          <p className="text-xs text-text-muted dark:text-text-dark-muted">Initializing map view</p>
        </div>
      </div>
    );
  }

  // Calculate zoom based on service radius
  const zoom = serviceRadius <= 2 ? 14 : serviceRadius <= 5 ? 13 : serviceRadius <= 10 ? 12 : 11;
  const mapCenter: [number, number] = [location.lat, location.lng];

  return (
    <div className="h-64 w-full sm:h-96 rounded-b-lg overflow-hidden" style={{ minHeight: '256px' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ 
          height: '100%', 
          width: '100%',
          minHeight: '256px'
        }}
        className="rounded-b-lg"
        scrollWheelZoom={true}
        key={`${location.lat}-${location.lng}-${serviceRadius}`}
      >
        {/* OpenStreetMap Tile Layer */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Guardian Location Marker */}
        <Marker
          position={mapCenter}
          icon={markerIconRef.current || undefined}
        />

        {/* Service Radius Circle */}
        <Circle
          center={mapCenter}
          radius={serviceRadius * 1000} // Convert km to meters
          pathOptions={{
            color: '#14b8a6',
            fillColor: '#14b8a6',
            fillOpacity: 0.1,
            weight: 2,
            opacity: 0.4,
          }}
        />
      </MapContainer>
    </div>
  );
}

