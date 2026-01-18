'use client';

import { useEffect } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  ZoomControl,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

/* Fix default marker icons (Next.js) */
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl:
      'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
}

export interface BaseMapProps {
  center: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    color?: 'user' | 'guardian';
  }>;
  circle?: {
    center: [number, number];
    radius: number;
  };
  height?: string;
}

/* Smooth map update */
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, zoom || map.getZoom(), { animate: true });
  }, [center, zoom, map]);

  return null;
}

export function BaseMap({
  center,
  zoom = 13,
  markers = [],
  circle,
  height = '220px',
}: BaseMapProps) {
  return (
    <div className="w-full">
      <div
        className="
          overflow-hidden
          rounded-xl
          border
          border-emerald-500/40
          dark:border-emerald-400/40
          bg-background
        "
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={zoom}
          zoomControl={false}
          scrollWheelZoom={false}
          attributionControl={false}   // ✅ FIX
          className="h-full w-full"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <ZoomControl position="topright" />
          <MapUpdater center={center} zoom={zoom} />

          {circle && (
            <Circle
              center={circle.center}
              radius={circle.radius * 1000}
              pathOptions={{
                color: '#10b981',
                fillColor: '#10b981',
                fillOpacity: 0.06,
                weight: 1,
              }}
            />
          )}

          {markers.map((marker, index) => (
            <Marker key={index} position={marker.position} />
          ))}
        </MapContainer>
      </div>
    </div>
  );
}







