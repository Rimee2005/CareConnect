# Map Integration Summary

## Overview

The map is now fully integrated across all relevant Vital dashboard pages with consistent location and radius handling. This document clarifies where the map appears, how location and radius are handled, and how it stays synchronized with guardian lists.

## Where the Map Appears

### 1. **Browse Guardians Page** (`/vital/guardians`)
**Primary Location**: Main guardian discovery page

**Map Features:**
- ✅ Full map integration with all guardians
- ✅ Radius selector (2km, 5km, 10km)
- ✅ Map bounds filtering (pan/zoom to filter)
- ✅ Location request button
- ✅ Mobile collapsible UI
- ✅ Synchronized with search, filters, and sorting

**Purpose**: Help users discover and filter guardians by location

---

### 2. **Guardian Detail Page** (`/vital/guardians/[id]`)
**Primary Location**: Individual guardian profile page

**Map Features:**
- ✅ Shows single guardian location
- ✅ Displays guardian's service radius
- ✅ Shows Vital user location (if available)
- ✅ Radius selector (for context, doesn't filter)
- ✅ Clean, focused UI

**Purpose**: Visualize guardian location and distance from user

---

### 3. **Vital Dashboard** (`/vital/dashboard`)
**Status**: Not currently showing map (by design)

**Reason**: Dashboard is an overview page. Map is available via "Browse Guardians" button.

**Future Enhancement**: Could optionally show active bookings on map

---

## How Location is Handled

### Location Priority (Automatic):
1. **Profile Location** (First Priority)
   - Fetched from Vital profile (`/api/vital/profile`)
   - Uses `location.coordinates.lat` and `location.coordinates.lng`
   - Stored in user profile during registration/profile creation

2. **Browser Geolocation** (Fallback)
   - If profile doesn't have coordinates, requests browser location
   - Uses `navigator.geolocation.getCurrentPosition()`
   - Requires user permission

3. **Manual Request** (User-Initiated)
   - "Use Location" button appears if no location available
   - User can click to request location permission
   - Useful if permission was previously denied

### Location State Management:
- **Shared Hook**: `useVitalLocation()` hook manages location across all pages
- **Consistent State**: Same location used on Browse Guardians and Detail pages
- **Auto-Fetch**: Location is automatically fetched when pages load
- **Manual Refresh**: `fetchVitalLocation()` can be called to refresh location

### Location Storage:
- **Profile**: Primary storage in Vital profile database
- **Session**: Cached in React state during session
- **No LocalStorage**: Location is not stored in localStorage (privacy)

---

## How Radius is Handled

### Radius Options:
- **2km**: Close proximity search
- **5km**: Medium range search
- **10km**: Wide area search (default)

### Radius Behavior by Page:

#### Browse Guardians Page:
- **Filters Results**: Only shows guardians within selected radius
- **Updates Map Zoom**: Map zooms to show radius circle
- **Combines with Filters**: Works with other filters (AND logic)
- **Updates List**: Guardian list updates when radius changes

#### Guardian Detail Page:
- **Visual Only**: Radius selector available but doesn't filter
- **Map Context**: Helps visualize distance context
- **No Filtering**: Single guardian shown regardless of radius

### Radius State Management:
- **Shared State**: Managed by `useVitalLocation()` hook
- **Default**: 10km on initial load
- **Persistent**: Maintains selected radius during session
- **Per-Page**: Each page can have different radius (stored in hook)

### Radius Circle Display:
- **Vital Location**: Circle around user's location showing search radius
- **Guardian Service Radius**: Circle around each guardian showing their service area
- **Visual Feedback**: Different colors for different purposes

---

## How Map Stays in Sync with Guardian List

### Synchronization Mechanisms:

#### 1. **Filter Changes → Map Updates**
- When user changes filters (specialization, days, gender, etc.)
- Guardian list is filtered
- Map markers are automatically updated to show only filtered guardians
- Uses React `useEffect` to watch filter state changes

#### 2. **Map Bounds Changes → List Updates**
- When user pans or zooms the map
- `onMapBoundsChange` callback fires with new bounds
- Guardian list is filtered to show only guardians in visible area
- Creates "pan to filter" experience

#### 3. **Radius Changes → Both Update**
- When user changes radius selector
- Map zoom updates to show radius circle
- Guardian list filters by distance within radius
- Both map and list update simultaneously

#### 4. **Search Changes → Both Update**
- When user types in search box (debounced 300ms)
- Guardian list filters by name/specialization
- Map markers update to show only matching guardians
- Map and list stay synchronized

### Real-Time Updates:
- **No Refresh Needed**: All updates happen in real-time
- **Optimized**: Debounced search prevents excessive updates
- **Smooth**: React state management ensures smooth transitions

### Filter Combination Logic:
All filters work together using AND logic:
- Search term AND
- Specializations AND
- Available days AND
- Gender AND
- Experience range AND
- Distance/radius AND
- Map bounds (if map moved)

---

## Technical Implementation

### Shared Location Hook:
```typescript
const { 
  vitalLocation,        // Current user location
  mapRadius,           // Current radius (2, 5, or 10)
  setMapRadius,        // Function to change radius
  requestCurrentLocation, // Function to request location
  fetchVitalLocation   // Function to refresh from profile
} = useVitalLocation();
```

### Map Component Usage:
```tsx
<GuardianMap
  guardians={filteredGuardians}      // Array of guardians to display
  vitalLocation={vitalLocation}      // User's location
  radius={mapRadius}                 // Current radius
  onRadiusChange={setMapRadius}      // Handle radius change
  onMapBoundsChange={setMapBounds}   // Handle map pan/zoom
  onLocationRequest={requestCurrentLocation} // Handle location request
  onGuardianClick={handleClick}      // Handle marker click
/>
```

### State Flow:
```
User Action → State Update → Filter Logic → Map Update → List Update
     ↓              ↓              ↓            ↓            ↓
  Change Filter → Update State → Filter Data → Update Markers → Update Cards
```

---

## User Experience Flow

### First-Time User:
1. Opens Browse Guardians page
2. System tries to get location from profile
3. If no profile location, requests browser permission
4. If denied, shows "Use Location" button
5. User can manually request location or browse without it

### Returning User:
1. Opens Browse Guardians page
2. Location automatically loaded from profile
3. Map shows guardians within default 10km radius
4. User can adjust radius, filters, or pan map
5. All changes update in real-time

### Detail Page Visit:
1. Clicks on guardian from list
2. Detail page loads with guardian location
3. Map shows single guardian + user location
4. User can see distance and service radius
5. Radius selector available for context

---

## Mobile Considerations

### Map Collapsibility:
- **Mobile**: Map can be collapsed to focus on list
- **Desktop**: Map always visible
- **Toggle**: Button in map header to collapse/expand

### Filter UI:
- **Mobile**: Bottom sheet drawer
- **Desktop**: Side panel
- **Same Functionality**: All filters work the same way

### Performance:
- **Lazy Loading**: Map loads only when needed
- **Marker Optimization**: Only visible markers rendered
- **Debounced Updates**: Prevents excessive re-renders

---

## Best Practices for Developers

1. **Always use `useVitalLocation` hook** for location state
2. **Check `featureFlags.MAP_VIEW`** before rendering map
3. **Handle missing coordinates gracefully** (show location request)
4. **Sync map with list** using bounds change callbacks
5. **Provide fallbacks** for location permission denial
6. **Maintain consistent radius** across pages using the hook
7. **Test on mobile** to ensure collapsible UI works
8. **Optimize marker rendering** for large guardian lists

---

## Troubleshooting

### Map Not Showing:
- Check `featureFlags.MAP_VIEW` is enabled
- Verify Google Maps API key is configured
- Check browser console for errors
- Ensure guardian has `location.coordinates`

### Location Not Working:
- Check if profile has coordinates
- Verify browser geolocation permission
- Check network connectivity
- Try manual location request button

### Map and List Out of Sync:
- Check filter state is properly updated
- Verify `onMapBoundsChange` callback is firing
- Check React state updates are happening
- Look for console errors

---

## Future Enhancements

1. **Dashboard Map**: Show active bookings on dashboard
2. **Route Planning**: Show directions to guardian
3. **Multiple Radius Options**: Add 15km, 20km options
4. **Location History**: Remember frequently used locations
5. **Offline Support**: Cache map tiles and locations
6. **Heat Map**: Show guardian density by area
7. **Clustering**: Group nearby guardians on map

