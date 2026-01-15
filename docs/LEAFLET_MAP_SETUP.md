# Leaflet Map Integration (OpenStreetMap)

## Overview

The map integration uses **OpenStreetMap with Leaflet** (via react-leaflet) - a completely free, open-source solution that requires **no API keys** or payment setup. This makes it perfect for production use without any cost concerns.

## Features

✅ **Free & Open Source** - No API keys or payment required  
✅ **OpenStreetMap Tiles** - Free map tiles from OpenStreetMap  
✅ **Guardian Markers** - Color-coded markers based on availability and AI recommendations  
✅ **Service Radius Overlays** - Visual circles showing guardian service areas  
✅ **Vital Location** - Shows user's location with radius circle  
✅ **Mobile-Friendly** - Collapsible map on mobile devices  
✅ **Light/Dark Mode** - Fully compatible with theme switching  
✅ **Graceful Fallback** - Falls back to list view if map fails  
✅ **Real-time Updates** - Map updates when filters change  

## Installation

The required packages are already installed:

```bash
npm install react-leaflet leaflet @types/leaflet
```

## Dependencies

- `react-leaflet`: ^4.2.1 - React bindings for Leaflet
- `leaflet`: ^1.9.4 - Core Leaflet library
- `@types/leaflet`: ^1.9.8 - TypeScript definitions

## Usage

The map is automatically integrated on the **Browse Guardians** page (`/vital/guardians`). No additional configuration is needed.

### Component Location

- **Component**: `components/LeafletMap.tsx`
- **Usage**: `app/vital/guardians/page.tsx`

## Map Features

### Marker Colors

- **Green** (#22c55e): Available guardians (has availability)
- **Amber** (#f59e0b): Busy guardians (limited availability)
- **Purple** (#8b5cf6): AI-recommended guardians
- **Teal** (#14b8a6): Vital user location

### Service Radius

- Each guardian marker has a translucent circle showing their service radius
- Color matches the marker color
- Helps visualize coverage area

### Radius Selection

- **2km**: Close proximity search
- **5km**: Medium range search
- **10km**: Wide area search (default)

### Mobile Features

- **Collapsible**: Map can be collapsed on mobile to focus on list
- **Touch-Friendly**: All controls are touch-optimized
- **Responsive**: Adapts to different screen sizes

## Light/Dark Mode Support

The map automatically adapts to light/dark mode:

- **Light Mode**: White popups, light controls
- **Dark Mode**: Dark popups, dark controls
- **Automatic**: Follows system/theme preference

CSS styles are defined in `app/globals.css`:

```css
.leaflet-popup-content-wrapper {
  background-color: rgb(255, 255, 255); /* Light mode */
}

.dark .leaflet-popup-content-wrapper {
  background-color: rgb(45, 55, 72); /* Dark mode */
}
```

## Graceful Fallback

If the map fails to load or location is unavailable:

1. **Shows Error Message**: "Map unavailable. Showing nearby care providers in list view."
2. **List View Continues**: Guardian list remains fully functional
3. **No Blocking**: Users can still browse and book guardians

## Performance

- **Lazy Loading**: Map components load only when needed
- **Dynamic Imports**: Prevents SSR issues
- **Optimized Markers**: Only visible markers rendered
- **Efficient Updates**: Map updates only when data changes

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## No Configuration Required

Unlike Google Maps or Mapbox, **no API keys or tokens are needed**. The map works out of the box using free OpenStreetMap tiles.

## Troubleshooting

### Map Not Showing

1. Check browser console for errors
2. Verify `featureFlags.MAP_VIEW` is enabled
3. Ensure Leaflet CSS is loaded (check network tab)
4. Check if location data is available

### Markers Not Appearing

1. Verify guardians have `location.coordinates` set
2. Check if coordinates are valid (lat: -90 to 90, lng: -180 to 180)
3. Ensure map is zoomed to appropriate level

### Performance Issues

1. Reduce number of visible guardians (use filters)
2. Check network connection (tiles load from OpenStreetMap)
3. Clear browser cache if tiles not loading

## Future Enhancements

- [ ] Cluster markers when zoomed out
- [ ] Custom map styles
- [ ] Offline tile caching
- [ ] Route planning
- [ ] Heat maps for guardian density

## License

OpenStreetMap and Leaflet are both open-source and free to use. No licensing fees or restrictions.

