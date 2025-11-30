# Medicine List Flicker Fix

## Issue
The medicines list screen was flickering when navigating back from the medicine details screen.

## Root Cause
Both screens were using `useFocusEffect` to refresh data when they came into focus:
- **Medicine Details Screen**: Refreshed medicine data and doses on focus
- **Medicines List Screen**: Refreshed all medicines on focus

When navigating back to the list screen:
1. `useFocusEffect` triggered
2. Called `refresh()` which forced a cache invalidation
3. Showed loading spinner briefly
4. Re-fetched all medicines from database
5. This caused the visible flicker

## Solution Implemented

### 1. Removed Automatic Refresh on Focus (Primary Fix)
**File**: `app/(tabs)/medicines/index.tsx`

Removed the `useFocusEffect` hook that was forcing a refresh every time the screen came into focus:

```typescript
// REMOVED:
useFocusEffect(
  useCallback(() => {
    refresh();
  }, [])
);
```

**Rationale**:
- The `useMedicines` hook already has a 30-second cache mechanism
- Cache is automatically invalidated when medicines are created/updated/deleted
- Users can manually refresh using pull-to-refresh
- No need to force refresh on every navigation

### 2. Improved Cache Loading State (Secondary Fix)
**File**: `lib/hooks/useMedicines.ts`

Modified the `loadMedicines` function to only show the loading spinner when there's no cached data:

```typescript
try {
  // Only show loading spinner if we don't have cached data to display
  if (!cacheRef.current) {
    setLoading(true);
  }
  // ... rest of loading logic
}
```

**Rationale**:
- Prevents unnecessary loading spinner when cache is being refreshed
- Provides smoother user experience during background updates
- Still shows loading on initial load when no data exists

## Benefits

1. **No More Flicker**: Smooth navigation back to medicines list
2. **Better Performance**: Reduces unnecessary database queries
3. **Maintains Freshness**: 30-second cache ensures data stays current
4. **Manual Control**: Users can pull-to-refresh when needed
5. **Smart Updates**: Cache invalidates automatically on CRUD operations

## Cache Behavior

- **Cache Duration**: 30 seconds
- **Automatic Invalidation**: When medicines are created, updated, or deleted
- **Manual Refresh**: Pull-to-refresh gesture
- **Initial Load**: Shows loading spinner (no cache exists)
- **Subsequent Loads**: Uses cache if valid, refreshes in background if expired

## Testing Checklist

- [x] Navigate from list to details and back - no flicker
- [x] Pull-to-refresh still works on list screen
- [x] Creating a medicine updates the list
- [x] Editing a medicine updates the list
- [x] Deleting a medicine updates the list
- [x] Cache expires after 30 seconds and refreshes
- [x] Initial app load shows loading spinner

## Related Files

- `app/(tabs)/medicines/index.tsx` - Medicines list screen
- `app/(tabs)/medicines/[id].tsx` - Medicine details screen
- `lib/hooks/useMedicines.ts` - Medicines data hook with caching
- `lib/utils/performance-helpers.ts` - Cache validation utility

## Date
November 30, 2025

