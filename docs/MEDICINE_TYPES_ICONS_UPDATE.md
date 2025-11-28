# Medicine Types Icons and Shared Constants Update

## Overview
This update consolidates medicine types into a single source of truth and adds visual icons to the medicine type selector for better UX.

## Changes Made

### 1. Created Shared Constants File
**File**: `constants/medicine-types.ts`

Created a centralized constant `MEDICINE_TYPES` that includes:
- All 20 medicine types
- Associated Ionicons for each type
- Proper TypeScript typing with `SelectOption` interface

This ensures consistency across add and edit screens.

### 2. Updated Select Component
**File**: `components/ui/Select.tsx`

Enhanced the Select component to support icons:
- Added optional `icon` property to `SelectOption` interface
- Added `showIcons` prop to enable/disable icon display
- Icons appear in the modal/drawer when selecting medicine types
- Icons are color-coded based on selection state

**New Interface**:
```typescript
export interface SelectOption {
  label: string;
  value: string;
  icon?: keyof typeof Ionicons.glyphMap;
}
```

### 3. Updated Add Medicine Screen
**File**: `app/(tabs)/medicines/add.tsx`

- Removed local `medicineTypes` constant
- Imported `MEDICINE_TYPES` from shared constants
- Enabled `showIcons` prop on the medicine type Select component

### 4. Updated Edit Medicine Screen
**File**: `app/(tabs)/medicines/edit/[id].tsx`

- Removed local `medicineTypes` constant (only had 6 old types)
- Imported `MEDICINE_TYPES` from shared constants
- Enabled `showIcons` prop on the medicine type Select component
- Now supports all 20 medicine types instead of just 6

### 5. Updated Design Constants
**File**: `constants/design.ts`

Added colors for all 20 medicine types:
- Light mode colors for each type
- Dark mode colors for each type
- Updated `getMedicineTypeColor()` helper to handle all types

**Color Palette**:
- **Pill/Tablet/Capsule**: Purple shades
- **Liquid/Syrup/Spray**: Cyan/Blue shades
- **Injection**: Red
- **Inhaler**: Green
- **Drops variants**: Blue shades
- **Nasal Spray**: Teal
- **Cream/Ointment/Gel**: Amber shades
- **Patch/Lozenge**: Pink shades
- **Powder**: Light Gray
- **Other**: Gray

## Icon Mappings

All medicine types now have associated Ionicons:

| Type | Icon | Ionicon Name |
|------|------|--------------|
| Pill | 💊 | `medical` |
| Tablet | 📱 | `tablet-portrait` |
| Capsule | ⭕ | `ellipse` |
| Liquid | 💧 | `water` |
| Syrup | 🧪 | `flask` |
| Injection | 💉 | `fitness` |
| Inhaler | ☁️ | `cloud` |
| Drops | 💧 | `water-outline` |
| Eye Drops | 👁️ | `eye` |
| Ear Drops | 👂 | `ear` |
| Nasal Spray | 👃 | `nose` |
| Cream | 🖐️ | `hand-left` |
| Ointment | 🖐️ | `hand-left` |
| Gel | 🖐️ | `hand-left` |
| Patch | 🩹 | `bandage` |
| Suppository | 💊 | `medical-outline` |
| Powder | ❄️ | `snow` |
| Lozenge | ⭕ | `ellipse-outline` |
| Spray | 💦 | `water-sharp` |
| Other | 💊 | `medical-outline` |

## Benefits

1. **Single Source of Truth**: Medicine types defined once, used everywhere
2. **Visual Clarity**: Icons help users quickly identify medicine types
3. **Consistency**: Same types and icons across add/edit screens
4. **Maintainability**: Easy to add new types or update existing ones
5. **Better UX**: Visual feedback in the selection modal
6. **Type Safety**: Proper TypeScript typing for icons

## Usage

To add a new medicine type in the future:

1. Add to `constants/medicine-types.ts`:
```typescript
{ label: "New Type", value: "new_type", icon: "icon-name" }
```

2. Add colors to `constants/design.ts`:
```typescript
// In Colors.light
new_type: '#HEX_COLOR',

// In Colors.dark
new_type: '#HEX_COLOR',
```

3. Add case to `getMedicineTypeColor()` in `constants/design.ts`

4. Add case to `getIconName()` in `components/medicine/MedicineTypeIcon.tsx`

5. Update database migration in `lib/database/schema.ts` to include the new type in the CHECK constraint

## Testing

To test the changes:
1. **Restart the app** to apply database migration
2. Navigate to Add Medicine screen
3. Tap on "Medicine Type" field
4. Verify all 20 types appear with icons
5. Select a new type (e.g., "Tablet", "Syrup", "Eye Drops")
6. Save the medicine
7. Edit the medicine and verify the type is preserved
8. Check that the correct icon appears on medicine cards

## Files Modified

- ✅ `constants/medicine-types.ts` (new file)
- ✅ `components/ui/Select.tsx`
- ✅ `app/(tabs)/medicines/add.tsx`
- ✅ `app/(tabs)/medicines/edit/[id].tsx`
- ✅ `constants/design.ts`
- ✅ `lib/database/schema.ts` (from previous update)
- ✅ `components/medicine/MedicineTypeIcon.tsx` (from previous update)

## Related Documentation

- See `MEDICINE_TYPES_UPDATE.md` for database migration details

