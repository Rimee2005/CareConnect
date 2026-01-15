# Map-Based Location System Setup Guide

## Overview

CareConnect now includes a comprehensive map-based location system that helps Vitals discover nearby Guardians, understand service radius, and make confident booking decisions.

## Features

✅ **Map View** - Visual Guardian discovery with interactive markers
✅ **Distance Calculation** - Real-time distance between Vital and Guardian locations
✅ **Service Radius Visualization** - Circular radius showing Guardian coverage area
✅ **AI Integration** - Highlights AI-recommended Guardians on the map
✅ **Privacy-Safe** - Approximate locations only, no exact addresses
✅ **Accessibility** - ARIA labels, keyboard navigation, screen reader support
✅ **Graceful Fallback** - Falls back to list view if map fails

## Environment Variables

Add these to your `.env.local`:

```env
# Map Provider (google or mapbox)
NEXT_PUBLIC_MAP_PROVIDER=google

# Google Maps API Key (if using Google Maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# OR Mapbox Access Token (if using Mapbox)
NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN=your_mapbox_token_here

# Feature Flags
NEXT_PUBLIC_FEATURE_MAP_VIEW=true
NEXT_PUBLIC_FEATURE_AI_MATCHING=true
```

## Getting API Keys

### Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Maps JavaScript API"
4. Create credentials (API Key)
5. Restrict the API key to your domain (recommended for production)

### Mapbox Access Token

1. Sign up at [Mapbox](https://www.mapbox.com/)
2. Go to Account → Access Tokens
3. Copy your default public token

## Database Schema

### Vital Profile Location
```typescript
location: {
  city: string;           // Required
  coordinates?: {
    lat: number;          // Optional, for map features
    lng: number;          // Optional, for map features
  };
}
```

### Guardian Profile Location
```typescript
location: {
  city: string;           // Required
  coordinates?: {
    lat: number;          // Optional, for map features
    lng: number;          // Optional, for map features
  };
}
serviceRadius: number;    // Required, in kilometers
```

## Geo Indexes

The following indexes are automatically created for fast location queries:

- `VitalProfileSchema.index({ 'location.coordinates': '2dsphere' })`
- `GuardianProfileSchema.index({ 'location.coordinates': '2dsphere' })`

## Map Features

### Marker Colors

- **Green/Teal** - Available Guardians (has availability)
- **Amber** - Busy Guardians (limited availability)
- **Purple** - AI-Recommended Guardians (when AI_MATCHING is enabled)

### Marker Interaction

- Click marker → Shows mini profile card popup
- Popup includes:
  - Profile photo
  - Name
  - Specialization badges
  - Star rating
  - Distance from Vital
  - AI recommendation (if applicable)
  - "View Details" button

### Service Radius

- Translucent circular overlay around each Guardian marker
- Color matches marker color
- Helps Vitals understand coverage area

## Distance Calculation

Uses Haversine formula for accurate distance calculation:

```typescript
calculateDistance(lat1, lon1, lat2, lon2) // Returns distance in km
formatDistance(distance) // Formats as "2.3 km away" or "500m away"
```

## Sorting Options

1. **Highest Rating** - Sort by average rating (default)
2. **AI-Recommended** - Sort by AI match score (if AI_MATCHING enabled)
3. **Nearest First** - Sort by calculated distance
4. **Most Experience** - Sort by years of experience
5. **Name (A-Z)** - Alphabetical

## Privacy & Safety

✅ **Never shows exact addresses** - Only approximate locations
✅ **Guardians cannot see Vital location** - Unless booking is confirmed
✅ **Location data is optional** - Map works without coordinates (shows list view)
✅ **Blur precision available** - Can be implemented if user requests

## Fallback Behavior

If:
- Location permission denied
- Map API key missing
- Map fails to load
- No coordinates available

Then:
- Shows list-based Guardian results
- Displays message: "Map unavailable. Showing nearby care providers."
- All other features continue to work

## Accessibility

✅ **ARIA labels** on map controls
✅ **Keyboard navigation** for zoom controls
✅ **Text alternatives** for distance info
✅ **Screen reader friendly** - Map not required to complete booking
✅ **Focus management** - Proper focus handling in popups

## Usage

### For Vitals

1. Navigate to "Browse Guardians"
2. Map appears above Guardian cards (if MAP_VIEW enabled)
3. Click markers to see Guardian details
4. Use filters and sorting to find nearby Guardians
5. Distance is shown on Guardian cards and map popups

### For Guardians

1. When creating profile, enter city
2. Optionally provide coordinates for better map placement
3. Set service radius (in km)
4. Your location will appear on the map for Vitals

## Troubleshooting

### Map Not Loading

1. Check API key is set in `.env.local`
2. Verify API key has correct permissions
3. Check browser console for errors
4. Ensure `NEXT_PUBLIC_FEATURE_MAP_VIEW=true`

### No Markers Showing

1. Verify Guardians have location coordinates
2. Check Guardian profiles have `location.coordinates` set
3. Ensure Vital has location coordinates for distance calculation

### Distance Not Calculating

1. Verify Vital profile has `location.coordinates`
2. Check Guardian profiles have `location.coordinates`
3. Distance only shows if both locations are available

## Future Enhancements

- [ ] Location autocomplete for easier coordinate entry
- [ ] Geocoding service integration
- [ ] Route planning between Vital and Guardian
- [ ] Real-time location updates
- [ ] Location privacy controls (blur precision)

