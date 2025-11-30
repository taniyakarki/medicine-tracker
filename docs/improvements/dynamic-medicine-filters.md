# Dynamic Medicine Type Filters

## Overview

Updated the medicines list screen to generate filter chips dynamically based on actual medicine types in the user's data, rather than showing all possible medicine types regardless of whether they exist.

## Changes Made

### Before (Hardcoded Filters)

The filter chips showed all 6 predefined medicine types (Pill, Liquid, Injection, Inhaler, Drops, Other) regardless of whether the user had medicines of those types.

```typescript
const typeFilters: FilterOption[] = [
  { id: "pill", label: "Pill", icon: "medical", count: ... },
  { id: "liquid", label: "Liquid", icon: "water", count: ... },
  { id: "injection", label: "Injection", icon: "fitness", count: ... },
  { id: "inhaler", label: "Inhaler", icon: "cloud", count: ... },
  { id: "drops", label: "Drops", icon: "rainy", count: ... },
  { id: "other", label: "Other", icon: "ellipsis-horizontal", count: ... },
];
```

### After (Dynamic Filters)

Filter chips are now generated dynamically from the actual medicine data:

```typescript
// Get unique medicine types from actual data
const uniqueTypes = Array.from(new Set(medicines.map((m) => m.type)));

// Create type filters dynamically based on actual medicine types
const typeFilters: FilterOption[] = uniqueTypes
  .map((type) => {
    // Find the medicine type definition from constants
    const medicineTypeDef = MEDICINE_TYPES.find((mt) => mt.value === type);

    return {
      id: type,
      label: medicineTypeDef?.label || type.charAt(0).toUpperCase() + type.slice(1),
      icon: (medicineTypeDef?.icon as keyof typeof Ionicons.glyphMap) || "medical-outline",
      count: medicines.filter((m) => m.type === type).length,
    };
  })
  .sort((a, b) => {
    // Sort by count (descending), then by label (alphabetically)
    if (b.count !== a.count) {
      return b.count - a.count;
    }
    return a.label.localeCompare(b.label);
  });
```

## Benefits

1. **Cleaner UI**: Only shows relevant filter options that have actual data
2. **Better UX**: Users don't see empty filter options (0 count)
3. **Scalable**: Automatically supports all 20+ medicine types from `MEDICINE_TYPES` constant
4. **Smart Sorting**: Filters are sorted by:
   - Primary: Count (most medicines first)
   - Secondary: Alphabetical order
5. **Fallback Handling**: If a medicine type isn't in the constants, it still displays with a capitalized label and default icon

## Filter Categories

### 1. Type Filters (Dynamic)
- Generated from actual medicine data
- Shows only types that exist in the user's medicines
- Sorted by count (descending), then alphabetically
- Uses icons and labels from `MEDICINE_TYPES` constant

### 2. Status Filters (Always Present)
- **Active**: Medicines that are currently active
- **Inactive**: Medicines that have been deactivated

### 3. Schedule Filters (Always Present)
- **Has Upcoming Dose**: Medicines with scheduled upcoming doses

## Implementation Details

### Data Flow

1. **Extract unique types**: `Array.from(new Set(medicines.map((m) => m.type)))`
2. **Map to filter options**: Look up each type in `MEDICINE_TYPES` for label and icon
3. **Sort intelligently**: By count first, then alphabetically
4. **Combine with static filters**: Status and schedule filters are always included

### Type Safety

- Uses proper TypeScript typing for Ionicons
- Provides fallback values if type not found in constants
- Type-safe filter option interface

### Performance

- Uses `useMemo` to prevent unnecessary recalculations
- Only recalculates when `medicines` array changes
- Efficient Set-based unique type extraction

## Files Modified

- `/app/(tabs)/medicines/index.tsx` - Updated filter generation logic
  - Added import for `MEDICINE_TYPES` constant
  - Replaced hardcoded type filters with dynamic generation
  - Added intelligent sorting logic

## Example Scenarios

### Scenario 1: User with 3 types
If user has:
- 5 Pills
- 3 Tablets
- 2 Liquids

Filters shown:
1. Pill (5)
2. Tablet (3)
3. Liquid (2)
4. Active (10)
5. Inactive (0)
6. Has Upcoming Dose (8)

### Scenario 2: User with many types
If user has medicines of 10 different types, all 10 type filters will be shown, sorted by count.

### Scenario 3: New medicine type
If a user adds a medicine with a type that's in `MEDICINE_TYPES` but wasn't previously used, it will automatically appear in the filters.

## Future Enhancements

Possible improvements:
1. Hide filters with 0 count (optional)
2. Group filters by category with section headers
3. Add "Show More" for many filter options
4. Remember user's filter preferences
5. Add filter presets (e.g., "My Daily Meds")

## Testing

To verify the dynamic filters:

1. Start with no medicines - only status and schedule filters should show
2. Add a medicine of type "Pill" - Pill filter should appear
3. Add a medicine of type "Liquid" - Liquid filter should appear
4. Add more Pills - Pill filter should show higher count and sort to top
5. Delete all Pills - Pill filter should disappear
6. Try different medicine types from the 20+ available options

## Date

November 30, 2025

