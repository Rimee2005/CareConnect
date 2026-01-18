'use client';

import dynamic from 'next/dynamic';

// Dynamically import BaseMap with SSR disabled to prevent production issues
const BaseMap = dynamic(() => import('./BaseMap').then(mod => ({ default: mod.BaseMap })), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
});

// Loading skeleton component
function MapLoadingSkeleton() {
  return (
    <div className="w-full h-full bg-background-secondary dark:bg-background-dark-secondary animate-pulse rounded-lg flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary/20 dark:border-primary-dark-mode/20 border-t-primary dark:border-t-primary-dark-mode rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-text-muted dark:text-text-dark-muted">Loading map...</p>
      </div>
    </div>
  );
}

// Export BaseMap as default for easier usage
export default BaseMap;

// Also export as named export for flexibility
export { BaseMap };

// Export BaseMapProps type for use in parent components
export type { BaseMapProps } from './BaseMap';
