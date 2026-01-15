# Map Integration Architecture

## Overview

The map integration is implemented across all relevant Vital dashboard pages to provide consistent location-based features. The map displays guardian locations, allows radius-based filtering, and stays synchronized with guardian lists.

## Architecture

### 1. Shared Location Hook (`hooks/useVitalLocation.ts`)

A custom React hook that manages:
- **Vital User Location**: Fetched from profile or requested from browser
- **Map Radius**: Default 10km, configurable (2km, 5km, 10km)
- **Location Permission**: Tracks permission request state
- **Loading State**: Indicates when location is being fetched

**Key Features:**
- Automatically fetches location from Vital profile on mount
- Falls back to browser geolocation if profile doesn't have coordinates
- Provides `requestCurrentLocation()` function for manual location requests
- Maintains consistent state across all pages

### 2. GuardianMap Component (`components/GuardianMap.tsx`)

Reusable map component that:
- Displays guardian markers with different colors based on availability
- Shows AI-recommended guardians with purple markers
- Displays service radius circles around each guardian
- Shows radius circle around Vital user location
- Supports mobile collapsible UI
- Handles map bounds changes for filtering

**Props:**
- `guardians`: Array of guardian objects with location data
- `vitalLocation`: User's current location
- `radius`: Search radius in km (2, 5, or 10)
- `onRadiusChange`: Callback when radius changes
- `onMapBoundsChange`: Callback when map is moved/zoomed
- `onLocationRequest`: Callback to request location permission
- `onGuardianClick`: Callback when guardian marker is clicked

## Map Integration by Page

### 1. Browse Guardians Page (`/vital/guardians`)

**Purpose**: Main guardian discovery page with full filtering and map integration

**Map Features:**
- Shows all filtered guardians based on search, filters, and sort
- Radius selector (2km, 5km, 10km) in map header
- Map bounds filtering: Moving/zooming map updates guardian list
- Location request button if no location available
- Mobile collapsible UI
- Synchronized with filter system

**Location & Radius Handling:**
- Uses `useVitalLocation` hook for consistent state
- Radius changes update both map zoom and filter results
- Map bounds changes filter guardians by visible area
- Location is shared across all guardian-related pages

**Synchronization:**
- Map markers update when filters change
- Guardian list updates when map bounds change
- Radius changes update both map and distance filters
- Search, filters, and map work together seamlessly

### 2. Guardian Detail Page (`/vital/guardians/[id]`)

**Purpose**: View individual guardian details with location

**Map Features:**
- Shows single guardian location
- Displays guardian's service radius circle
- Shows Vital user location if available
- Radius selector for context (doesn't filter on this page)
- Clean, minimal UI focused on the specific guardian

**Location & Radius Handling:**
- Uses same `useVitalLocation` hook
- Radius selector available but doesn't filter (single guardian)
- Location helps visualize distance to guardian

### 3. Vital Dashboard (`/vital/dashboard`)

**Purpose**: Overview page showing active bookings

**Map Features (Optional Enhancement):**
- Could show active bookings with guardian locations
- Useful for seeing where active services are happening
- Not currently implemented but architecture supports it

## Location & Radius Flow

### Location Priority:
1. **Profile Location**: First tries to get coordinates from Vital profile
2. **Browser Geolocation**: Falls back to requesting browser location
3. **Manual Request**: User can click "Use Location" button to request permission

### Radius Handling:
- **Default**: 10km
- **Options**: 2km, 5km, 10km (selectable in map header)
- **Behavior**: 
  - On Browse Guardians: Filters results and updates map zoom
  - On Detail Page: Only affects map zoom, doesn't filter
  - Persists across page navigation (stored in hook state)

### Map Bounds Synchronization:
- When user moves/zooms map, `onMapBoundsChange` callback fires
- Bounds are used to filter guardians by visible area
- This creates a "pan to filter" experience
- Works in combination with other filters (AND logic)

## State Management

### Location State:
- Managed by `useVitalLocation` hook
- Shared across all pages using the hook
- Automatically fetches on mount
- Can be manually refreshed with `fetchVitalLocation()`

### Radius State:
- Managed by `useVitalLocation` hook
- Default: 10km
- Can be changed via `setMapRadius()`
- Persists during session

### Filter State:
- Managed locally on Browse Guardians page
- Includes: search, specializations, days, gender, experience, distance
- Combined with map bounds for final filtering

## Mobile Considerations

### Collapsible Map:
- On mobile (< 768px), map can be collapsed/expanded
- Toggle button in map header
- Default: Expanded (user can collapse if needed)
- On desktop: Always visible

### Filter UI:
- Mobile: Bottom sheet drawer
- Desktop: Side panel
- Same functionality, different presentation

## Best Practices

1. **Always use `useVitalLocation` hook** for location state
2. **Check `featureFlags.MAP_VIEW`** before rendering map
3. **Handle missing coordinates gracefully** (show location request button)
4. **Sync map with list** using bounds change callbacks
5. **Provide fallbacks** for location permission denial
6. **Maintain consistent radius** across pages using the hook

## Future Enhancements

1. **Dashboard Map**: Show active bookings on map
2. **Route Planning**: Show directions to guardian
3. **Multiple Radius Options**: Add more radius choices (15km, 20km)
4. **Location History**: Remember frequently used locations
5. **Offline Support**: Cache map tiles and guardian locations

