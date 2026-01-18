'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js - only run on client side
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

export interface BaseMapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    label?: string;
    color?: string;
  }>;
  circle?: {
    center: [number, number];
    radius: number; // in kilometers
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
  };
  className?: string;
  height?: string;
}

// Component to update map center when prop changes
function MapUpdater({ center, zoom }: { center: [number, number]; zoom?: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom || map.getZoom());
  }, [center, zoom, map]);

  return null;
}

export function BaseMap({
  center,
  zoom = 13,
  markers = [],
  circle,
  className = '',
  height = '400px',
}: BaseMapProps) {
  // Create custom icon for Vital (user) marker
  const createCustomIcon = (color: string = '#14b8a6', label?: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <div style="
            transform: rotate(45deg);
            color: white;
            font-weight: bold;
            font-size: 18px;
            line-height: 26px;
            text-align: center;
          ">${label || '📍'}</div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  // Create guardian marker icon
  const createGuardianIcon = () => {
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="
          background-color: #fb923c;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12],
    });
  };

  return (
    <div className={`w-full rounded-lg overflow-hidden border border-border dark:border-border-dark/50 shadow-md ${className}`} style={{ height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={true}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={center} zoom={zoom} />
        
        {/* Draw circle for service radius */}
        {circle && (
          <Circle
            center={circle.center}
            radius={circle.radius * 1000} // Convert km to meters
            pathOptions={{
              color: circle.color || '#14b8a6',
              fillColor: circle.fillColor || '#14b8a6',
              fillOpacity: circle.fillOpacity || 0.15,
              weight: 2,
            }}
          />
        )}

        {/* Render markers */}
        {markers.map((marker, index) => (
          <Marker
            key={index}
            position={marker.position}
            icon={marker.color === 'user' ? createCustomIcon('#14b8a6', '📍') : createGuardianIcon()}
          />
        ))}
      </MapContainer>
    </div>
  );
}
