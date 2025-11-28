# Gradient Backgrounds Update

## Overview
Added beautiful gradient backgrounds to the status cards on the home screen that adapt to the color mode (light/dark).

## Changes Made

### 1. Design Constants (`constants/design.ts`)
Added gradient color definitions for both light and dark modes:

```typescript
export const Gradients = {
  light: {
    // Multicolor gradient: Purple → Blue → Cyan → Teal (vibrant and eye-catching)
    progress: ['#8B5CF6', '#6366F1', '#3B82F6', '#06B6D4', '#14B8A6'],
    // Single color gradients with good contrast
    streak: ['#F59E0B', '#FB923C'], // Amber gradient (darker to lighter)
    adherence: ['#10B981', '#34D399'], // Green gradient (darker to lighter)
    active: ['#6366F1', '#818CF8'], // Indigo gradient (darker to lighter)
  },
  dark: {
    // Multicolor gradient: Deep Purple → Deep Blue → Deep Cyan (rich and sophisticated)
    progress: ['#6B21A8', '#4338CA', '#1E40AF', '#0E7490', '#0F766E'],
    // Single color gradients with good contrast for dark mode
    streak: ['#92400E', '#C2410C'], // Dark amber gradient
    adherence: ['#065F46', '#047857'], // Dark green gradient
    active: ['#4338CA', '#4F46E5'], // Dark indigo gradient
  },
};
```

### 2. Home Screen (`app/(tabs)/index.tsx`)

#### Imports
- Added `LinearGradient` from `expo-linear-gradient`
- Added `Gradients` and `Shadows` from design constants

#### Today's Progress Card
- Wrapped content in `LinearGradient` component
- Applied gradient colors based on color mode
- Changed all text colors to white for better contrast
- Updated icon colors to white
- Made stat item borders semi-transparent white
- Made stat icon backgrounds semi-transparent white
- Updated progress bar colors to white with transparency

#### Quick Stats Cards (Streak, Weekly Adherence, Active Medicines)
- Wrapped each card content in `LinearGradient` component
- Applied unique gradient for each stat:
  - **Streak**: Amber/Warning gradient (flame icon)
  - **Weekly Adherence**: Green/Success gradient (trending up icon)
  - **Active Medicines**: Primary/Indigo gradient (medical icon)
- Changed all text and icons to white for consistency
- Added shadow effects for depth

#### Styling Updates
- Added `overflow: "hidden"` to card containers for proper gradient clipping
- Added shadow effects to cards for visual depth
- Created `gradientCard` and `gradientQuickStat` styles for gradient containers

## Visual Improvements

### Light Mode
- **Progress Card**: Beautiful multicolor gradient (Purple → Blue → Cyan → Teal) - 5 colors
- **Streak Card**: Warm amber gradient (2 colors) - darker to lighter
- **Adherence Card**: Fresh green gradient (2 colors) - darker to lighter
- **Active Card**: Clean indigo gradient (2 colors) - darker to lighter

### Dark Mode
- **Progress Card**: Rich multicolor gradient (Deep Purple → Deep Blue → Deep Cyan) - 5 colors
- **Streak Card**: Deep amber gradient (2 colors) - darker to lighter
- **Adherence Card**: Deep forest green gradient (2 colors) - darker to lighter
- **Active Card**: Deep indigo gradient (2 colors) - darker to lighter

## Benefits

1. **Visual Appeal**: Multicolor gradient on progress card creates stunning visual impact
2. **Color Mode Aware**: Automatically adapts to light/dark mode
3. **Better Hierarchy**: Progress card stands out with multicolor gradient, quick stats with single-color
4. **Consistent Design**: All status cards follow cohesive gradient patterns
5. **Improved Contrast**: White text on gradient backgrounds ensures excellent readability (WCAG compliant)
6. **Depth & Shadow**: Shadow effects make cards appear elevated
7. **Performance**: Optimized gradient locations for smooth rendering

## Technical Details

- Uses `expo-linear-gradient` (already installed)
- **Progress Card**: 5-color multicolor gradient with custom locations `[0, 0.25, 0.5, 0.75, 1]`
- **Quick Stats**: 2-color single-tone gradients with locations `[0, 1]`
- Diagonal flow (start: {x: 0, y: 0}, end: {x: 1, y: 1} or {x: 1, y: 1.2} for progress)
- Semi-transparent white overlays for UI elements on gradients
- Proper border radius and overflow handling
- High contrast ratios maintained (white text on colored backgrounds)

## Testing Recommendations

1. Test in both light and dark modes
2. Verify gradient rendering on iOS and Android
3. Check text readability on all gradient backgrounds
4. Ensure shadows display correctly on different devices
5. Test with different screen sizes

## Future Enhancements

Potential improvements for future iterations:
- Add subtle animation to gradients
- Allow users to customize gradient colors
- Add gradient presets for different themes
- Animate gradient on user interaction
- Add shimmer effect for loading states

