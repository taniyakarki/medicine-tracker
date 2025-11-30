# Filter Chips Scroll Persistence Fix (iOS)

## Issue

When clicking on filter pills (chips) that were scrolled to the right (hidden pills) on iOS devices, the horizontal scroll position would reset to the beginning. This made it difficult to interact with filters that were not initially visible.

## Root Cause

The issue was caused by how `FlatList`'s `ListHeaderComponent` was being used in the medicines list screen:

1. **Function-based header**: The header was rendered using `useCallback` returning JSX
2. **iOS remounting behavior**: When the parent component re-rendered due to state changes (e.g., `selectedFilters` changing), iOS would aggressively remount the header component
3. **Lost internal state**: The `FilterChips` component inside the header would lose its internal scroll position state (`scrollPositionRef`) when remounted

### Previous Implementation

```typescript
const renderHeader = useCallback(
  () => (
    <View style={styles.headerContainer}>
      <FilterChips
        filters={filterOptions}
        selectedFilters={selectedFilters}
        onFilterToggle={handleFilterToggle}
        onClearAll={handleClearFilters}
      />
    </View>
  ),
  [/* dependencies */]
);

<FlatList
  ListHeaderComponent={renderHeader}
  // ...
/>
```

## Solution

Replace the function-based header with **direct JSX** in the `ListHeaderComponent` prop. This leverages React 19's automatic optimization and prevents the header from being remounted.

### New Implementation

```typescript
<FlatList
  ListHeaderComponent={
    <View style={styles.headerContainer}>
      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search medicines..."
        onClear={handleClearSearch}
      />

      {/* Filter Chips */}
      <FilterChips
        filters={filterOptions}
        selectedFilters={selectedFilters}
        onFilterToggle={handleFilterToggle}
        onClearAll={handleClearFilters}
      />

      {/* Results Count */}
      {(searchQuery.trim() || selectedFilters.length > 0) && (
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsText, { color: colors.textSecondary }]}>
            {filteredMedicines.length}{" "}
            {filteredMedicines.length === 1 ? "result" : "results"} found
          </Text>
        </View>
      )}
    </View>
  }
  // ...
/>
```

## Why This Works

1. **Direct JSX**: React 19's compiler handles optimization automatically without needing `React.memo` or `useCallback`
2. **Component Identity Preserved**: The header maintains its identity across renders, preventing remounting
3. **Internal State Preserved**: The `FilterChips` component keeps its scroll position because it's not being destroyed and recreated
4. **iOS-Specific Fix**: This approach is more stable on iOS where component remounting is more aggressive

## Files Modified

- `/app/(tabs)/medicines/index.tsx` - Removed `renderHeader` function and replaced with direct JSX

## Testing

To verify the fix:

1. Open the medicines list screen on an iOS device
2. Add multiple medicines with different types
3. Scroll the filter pills horizontally to reveal hidden filters
4. Click on a filter pill that's scrolled to the right
5. Verify that the scroll position is maintained after clicking

## Related Components

- `/components/ui/FilterChips.tsx` - Contains the scroll position preservation logic using refs
- The `FilterChips` component already had scroll preservation logic, but it was being bypassed by the parent remounting issue

## React 19 Best Practice

In React 19, prefer **direct JSX** for `FlatList` header/footer components instead of function references. The React 19 compiler automatically optimizes these without needing manual memoization.

### ✅ Good (React 19)
```typescript
<FlatList
  ListHeaderComponent={<HeaderContent />}
/>
```

### ❌ Avoid (causes remounting on iOS)
```typescript
const renderHeader = useCallback(() => <HeaderContent />, [deps]);
<FlatList
  ListHeaderComponent={renderHeader}
/>
```

## Date

November 30, 2025

