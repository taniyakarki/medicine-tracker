# Emergency Contact Relationship Select Field

## Enhancement
Replaced the free-text input field for "Relationship" with a Select dropdown component in both Add and Edit Emergency Contact screens.

## Changes Made

### 1. Add Emergency Contact Screen (`add.tsx`)

**Before**: Free text input
```typescript
<TextInput
  value={relationship}
  onChangeText={(text) => setRelationship(text)}
  placeholder="e.g., Spouse, Parent, Friend"
/>
```

**After**: Select dropdown
```typescript
<Select
  label="Relationship"
  value={relationship}
  options={relationshipOptions}
  onSelect={(value) => setRelationship(value)}
  placeholder="Select relationship"
  required
/>
```

### 2. Edit Emergency Contact Screen (`edit/[id].tsx`)

Same change as above - replaced TextInput with Select component.

## Relationship Options

The following predefined options are available:

1. **Spouse** - Married partner
2. **Parent** - Mother or father
3. **Child** - Son or daughter
4. **Sibling** - Brother or sister
5. **Partner** - Unmarried partner
6. **Friend** - Close friend
7. **Relative** - Extended family member
8. **Neighbor** - Nearby resident
9. **Caregiver** - Professional or personal caregiver
10. **Doctor** - Medical professional
11. **Other** - Any other relationship

## Benefits

### User Experience
- ✅ **Faster input** - Select from list instead of typing
- ✅ **Consistent data** - Standardized relationship values
- ✅ **No typos** - Eliminates spelling errors
- ✅ **Better organization** - Easier to filter/group contacts by relationship
- ✅ **Mobile-friendly** - Native picker UI on mobile devices

### Data Quality
- ✅ **Standardized values** - Same relationships across all contacts
- ✅ **Easier querying** - Can filter by exact relationship type
- ✅ **Better analytics** - Can count contacts by relationship
- ✅ **Validation** - Ensures valid relationship is selected

### UI Consistency
- ✅ **Matches medicine forms** - Uses same Select component
- ✅ **Professional appearance** - Polished dropdown interface
- ✅ **Error handling** - Built-in validation and error display
- ✅ **Theme support** - Automatically adapts to dark/light mode

## Implementation Details

### Component Used
- `Select` component from `components/ui/Select.tsx`
- Same component used throughout the app for consistent UX

### Options Array
```typescript
const relationshipOptions: SelectOption[] = [
  { label: "Spouse", value: "Spouse" },
  { label: "Parent", value: "Parent" },
  { label: "Child", value: "Child" },
  { label: "Sibling", value: "Sibling" },
  { label: "Partner", value: "Partner" },
  { label: "Friend", value: "Friend" },
  { label: "Relative", value: "Relative" },
  { label: "Neighbor", value: "Neighbor" },
  { label: "Caregiver", value: "Caregiver" },
  { label: "Doctor", value: "Doctor" },
  { label: "Other", value: "Other" },
];
```

### Validation
- Field is still required (marked with *)
- Error handling remains the same
- Validation checks for non-empty value

## Visual Comparison

### Before (TextInput)
```
┌─────────────────────────────────┐
│ Relationship *                  │
│ ┌─────────────────────────────┐ │
│ │ 👥 e.g., Spouse, Parent...  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### After (Select Dropdown)
```
┌─────────────────────────────────┐
│ Relationship *                  │
│ ┌─────────────────────────────┐ │
│ │ Select relationship      ▼  │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

When tapped:
┌─────────────────────────────────┐
│ Spouse                          │
│ Parent                          │
│ Child                           │
│ Sibling                         │
│ Partner                         │
│ Friend                          │
│ Relative                        │
│ Neighbor                        │
│ Caregiver                       │
│ Doctor                          │
│ Other                           │
└─────────────────────────────────┘
```

## Files Modified

1. `app/(tabs)/profile/emergency-contacts/add.tsx`
   - Added Select import
   - Added relationshipOptions array
   - Replaced TextInput with Select component

2. `app/(tabs)/profile/emergency-contacts/edit/[id].tsx`
   - Added Select import
   - Added relationshipOptions array
   - Replaced TextInput with Select component

## Testing Checklist

- [x] Add emergency contact with select dropdown
- [x] Edit emergency contact with select dropdown
- [x] All relationship options appear in dropdown
- [x] Selected value displays correctly
- [x] Validation works (required field)
- [x] Error messages display properly
- [x] Dark mode support
- [x] Light mode support
- [x] iOS native picker
- [x] Android native picker
- [x] Saves correctly to database

## Future Enhancements

### Possible Additions
1. **Custom relationship** - Allow "Other" to open text input
2. **Multiple relationships** - Select multiple (e.g., "Parent & Caregiver")
3. **Relationship icons** - Add icons for each relationship type
4. **Sorting** - Sort contacts by relationship in profile view
5. **Quick filters** - Filter emergency contacts by relationship

### Database Considerations
- Current implementation stores relationship as string
- Compatible with existing database schema
- No migration needed
- Backward compatible with existing contacts

## Related Components

- `components/ui/Select.tsx` - Dropdown component
- `app/(tabs)/profile/index.tsx` - Profile screen showing contacts
- `lib/database/models/emergency-contact.ts` - Database operations

## Best Practices Applied

1. **Reusable component** - Uses existing Select component
2. **Consistent UX** - Matches medicine form patterns
3. **Accessibility** - Native picker supports screen readers
4. **Validation** - Maintains required field validation
5. **Error handling** - Clear error messages
6. **Theme support** - Respects user's theme preference

