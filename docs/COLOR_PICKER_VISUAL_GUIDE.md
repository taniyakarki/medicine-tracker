# Color Picker Visual Guide

## Component States

### 1. Initial State (No Color Selected)

```
┌─────────────────────────────────────────────────┐
│ Medicine Color                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯ │
│                                                 │
│  ℹ️  Choose a color to help identify this       │
│     medicine quickly                            │
└─────────────────────────────────────────────────┘
```

**Features:**
- Clean header with label
- 18 color options in organized grid
- Helper text with info icon
- Spacious layout (16px gaps)

---

### 2. Hovering/Pressing a Color

```
┌─────────────────────────────────────────────────┐
│ Medicine Color                                  │
├─────────────────────────────────────────────────┤
│                                                 │
│  ◯  ◯  ⦿  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯ │
│        Blue                                     │
│                                                 │
│  ℹ️  Choose a color to help identify this       │
│     medicine quickly                            │
└─────────────────────────────────────────────────┘
```

**Features:**
- Pressed color scales to 1.05x
- 2px border appears
- Color name shows below the button
- Immediate visual feedback

---

### 3. Color Selected

```
┌─────────────────────────────────────────────────┐
│ Medicine Color                    [× Clear]     │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │ ■ Blue                                  ✓  │ │
│ │   #3B82F6                                   │ │
│ └─────────────────────────────────────────────┘ │
│                                                 │
│  ◯  ◯  ⦿  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯  ◯ │
│        Blue                                     │
└─────────────────────────────────────────────────┘
```

**Features:**
- Clear button appears in header
- Rich selection banner with:
  - Large color preview (40x40px)
  - Color name (bold)
  - Hex code (smaller text)
  - Success checkmark
- Selected color in grid:
  - Scales to 1.1x (larger)
  - 4px border
  - Checkmark with dark overlay
  - Color name below
- Helper text hidden (replaced by banner)

---

## Color Organization

### Row 1: Warm Colors
```
🔴 Red    🌹 Rose    💗 Pink    💜 Fuchsia
```

### Row 2: Cool Colors (Part 1)
```
🟣 Purple    🟣 Violet    🔵 Indigo
```

### Row 3: Cool Colors (Part 2)
```
🔵 Blue    🔵 Sky    🔵 Cyan
```

### Row 4: Nature Colors
```
🟢 Teal    🟢 Emerald    🟢 Green    🟢 Lime
```

### Row 5: Bright Colors
```
🟡 Yellow    🟠 Amber    🟠 Orange
```

### Row 6: Neutrals
```
⚫ Gray
```

---

## Interactive States

### Button States

#### Default (Not Selected, Not Pressed)
```
┌──────┐
│      │  Size: 56x56px
│  ◯   │  Border: None
│      │  Scale: 1.0
└──────┘
```

#### Pressed (Not Selected)
```
┌──────┐
│ ┌──┐ │  Size: 56x56px
│ │◯ │ │  Border: 2px (theme border color)
│ └──┘ │  Scale: 1.05
└──────┘
```

#### Selected
```
┌──────┐
│┌────┐│  Size: 56x56px
││ ⦿  ││  Border: 4px (theme text color)
││ ✓  ││  Scale: 1.1
│└────┘│  Checkmark: White on dark overlay
└──────┘
```

---

## Selection Banner Anatomy

```
┌─────────────────────────────────────────────────┐
│  ┌────┐  Blue                               ✓  │
│  │ ■  │  #3B82F6                                │
│  └────┘                                         │
└─────────────────────────────────────────────────┘
   (1)      (2)                                (4)
            (3)

(1) Color Preview - 40x40px square with rounded corners
(2) Color Name - Bold, 16px font
(3) Hex Code - Secondary text, 12px font
(4) Success Icon - Green checkmark, 24px
```

---

## Spacing & Layout

### Grid Spacing
```
Button  Gap   Button  Gap   Button
[56px] [16px] [56px] [16px] [56px]
         ↑
    Increased from 8px
```

### Vertical Spacing
```
Header
  ↓ 16px
Selection Banner (if selected)
  ↓ 16px
Color Grid
  ↓ 16px
Helper Text / Error (if applicable)
```

---

## Color Palette

### All Available Colors

| Color | Hex | Category |
|-------|-----|----------|
| Red | #EF4444 | Warm |
| Rose | #F43F5E | Warm |
| Pink | #EC4899 | Warm |
| Fuchsia | #D946EF | Warm |
| Purple | #A855F7 | Cool |
| Violet | #8B5CF6 | Cool |
| Indigo | #6366F1 | Cool |
| Blue | #3B82F6 | Cool |
| Sky | #0EA5E9 | Cool |
| Cyan | #06B6D4 | Cool |
| Teal | #14B8A6 | Nature |
| Emerald | #059669 | Nature |
| Green | #10B981 | Nature |
| Lime | #84CC16 | Nature |
| Yellow | #EAB308 | Bright |
| Amber | #F59E0B | Bright |
| Orange | #F97316 | Bright |
| Gray | #6B7280 | Neutral |

---

## Responsive Behavior

### Mobile (Small Screens)
- Colors wrap to multiple rows
- 3-4 colors per row typically
- Touch targets are large (56px)
- Adequate spacing prevents mis-taps

### Tablet (Medium Screens)
- 5-6 colors per row
- Same touch target size
- More colors visible at once

### Desktop (Large Screens)
- All colors may fit in fewer rows
- Hover states work with mouse
- Press states work with touch

---

## Dark Mode Differences

### Light Mode
- Border colors: Light gray (#E5E7EB)
- Text: Dark (#111827)
- Background: White
- Selection banner: Light gray background

### Dark Mode
- Border colors: Medium gray (#374151)
- Text: Light (#F9FAFB)
- Background: Dark gray (#1F2937)
- Selection banner: Medium gray background

**Note:** All colors remain vibrant in both modes!

---

## Animation & Transitions

### Scale Transitions
```
Default → Pressed: 1.0 → 1.05 (smooth)
Pressed → Selected: 1.05 → 1.1 (smooth)
Selected → Default: 1.1 → 1.0 (smooth)
```

### Border Transitions
```
None → 2px (on press)
2px → 4px (on selection)
4px → None (on deselection)
```

### Opacity Transitions
```
Color name: 0 → 1 (fade in on press/selection)
Color name: 1 → 0 (fade out on release/deselection)
```

---

## Accessibility Features

### Screen Reader Support
- Each color button announces: "Select [Color Name] color"
- Selection state is announced
- Clear button announces: "Clear color selection"

### Visual Indicators
- High contrast checkmark (white on dark background)
- Bold borders for selection (4px)
- Large touch targets (56x56px)
- Clear visual feedback on all interactions

### Keyboard Navigation
- All buttons are focusable
- Clear button is accessible via keyboard
- Proper tab order

---

## Usage Examples

### In Add Medicine Screen
Located in the "Appearance" card, after the image picker:
```
┌─────────────────────────────────────┐
│ Image                               │
│ [Image picker UI]                   │
│                                     │
│ Medicine Color                      │
│ [Color picker UI]                   │
└─────────────────────────────────────┘
```

### In Edit Medicine Screen
Same location, but may show pre-selected color:
```
┌─────────────────────────────────────┐
│ Image                               │
│ [Current image]                     │
│                                     │
│ Medicine Color        [× Clear]     │
│ ┌─────────────────────────────────┐ │
│ │ ■ Purple                    ✓  │ │
│ │   #A855F7                       │ │
│ └─────────────────────────────────┘ │
│ [Color grid with Purple selected]   │
└─────────────────────────────────────┘
```

---

## Performance Notes

- Lightweight component (no heavy dependencies)
- Efficient re-renders (only affected buttons update)
- Smooth animations (native driver where possible)
- No network requests
- Minimal state management

---

## Browser/Device Compatibility

✅ iOS (Safari, Chrome)
✅ Android (Chrome, Firefox)
✅ Web (All modern browsers)
✅ Tablets
✅ Large phones
✅ Small phones (320px width+)

---

This visual guide provides a comprehensive overview of the improved color picker component!

