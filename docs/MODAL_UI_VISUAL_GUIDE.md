# Status Change Modal - Visual Design Guide

## 🎨 Complete Modal Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Change Dose Status                                    [✗]  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  💊  Aspirin                                         │  │
│  │      500 mg                                          │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐│  │
│  │  │ 🕐 Today at 9:00 AM                             ││  │
│  │  └─────────────────────────────────────────────────┘│  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐│  │
│  │  │ ✓ Current Status: Taken                         ││  │
│  │  └─────────────────────────────────────────────────┘│  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                                               │
│  Change Status To:                                           │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ┌────────┐                                           │  │
│  │  │   ✓    │  Taken                      ┌─────────┐  │  │
│  │  │        │  Medicine was consumed      │ Current │  │  │
│  │  └────────┘                             └─────────┘  │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ┌────────┐                                           │  │
│  │  │   ✗    │  Missed                                   │  │
│  │  │        │  Forgot to take medicine                  │  │
│  │  └────────┘                                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  ┌────────┐                                           │  │
│  │  │   ⊖    │  Skipped                                  │  │
│  │  │        │  Intentionally not taken                  │  │
│  │  └────────┘                                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## 📐 Component Breakdown

### 1. Dose Details Card

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  [Icon]  Medicine Name (XL, Bold)              │
│          Dosage & Unit (Base)                  │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ [Clock] Time (Small, Secondary)           │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
│  ┌───────────────────────────────────────────┐ │
│  │ [Status Icon] Current Status: Status      │ │
│  └───────────────────────────────────────────┘ │
│                                                 │
└─────────────────────────────────────────────────┘

Styling:
• Padding: 20px (lg)
• Border Radius: 12px (lg)
• Border: 1px solid (dynamic)
• Background: Surface Secondary (dynamic)
```

### 2. Status Option Button

```
┌─────────────────────────────────────────────────┐
│                                                 │
│  ┌──────────┐                                  │
│  │          │  Status Name (Base, Semibold)    │
│  │   Icon   │  Description (XS, Secondary)     │
│  │          │                                  │
│  └──────────┘                   [Current Badge]│
│                                                 │
└─────────────────────────────────────────────────┘

Styling:
• Padding: 20px (lg)
• Border Radius: 12px (lg)
• Border: 2px solid (dynamic)
• Background: Surface Secondary or Status Color 20%
• Icon Container: 48x48px with status color 20% bg
```

### 3. Current Status Badge

```
┌─────────────┐
│   Current   │
└─────────────┘

Styling:
• Padding: 4px 8px
• Border Radius: 8px (md)
• Background: Status Color (full opacity)
• Text: White, XS, Bold
```

## 🎨 Color Specifications

### Status Colors (Light & Dark Mode Compatible)

#### Taken (Success)
```
Icon Container: rgba(76, 175, 80, 0.2)  // Green 20%
Border (Active): #4CAF50                 // Green 100%
Badge: #4CAF50                           // Green 100%
Icon: #4CAF50                            // Green 100%
```

#### Missed (Danger)
```
Icon Container: rgba(244, 67, 54, 0.2)  // Red 20%
Border (Active): #F44336                 // Red 100%
Badge: #F44336                           // Red 100%
Icon: #F44336                            // Red 100%
```

#### Skipped (Warning)
```
Icon Container: rgba(255, 152, 0, 0.2)  // Orange 20%
Border (Active): #FF9800                 // Orange 100%
Badge: #FF9800                           // Orange 100%
Icon: #FF9800                            // Orange 100%
```

### Dynamic Colors

#### Light Mode
```
Background:        #FFFFFF
Surface:           #F5F5F5
Surface Secondary: #FAFAFA
Border:            #E0E0E0
Text:              #000000
Text Secondary:    #757575
```

#### Dark Mode
```
Background:        #121212
Surface:           #1E1E1E
Surface Secondary: #2C2C2C
Border:            #333333
Text:              #FFFFFF
Text Secondary:    #B0B0B0
```

## 📏 Spacing System

```
XS:  4px   - Small gaps, badge padding
SM:  8px   - Icon gaps, small margins
MD:  16px  - Standard spacing, card gaps
LG:  20px  - Card padding, button padding
XL:  24px  - Section spacing
```

## 🔤 Typography Scale

```
XS:   12px  - Subtext, badge text
SM:   14px  - Secondary text, time
Base: 16px  - Body text, status names
LG:   18px  - Section titles
XL:   20px  - Medicine name
2XL:  24px  - Main headers
```

## 📱 Touch Targets

```
Minimum Touch Target: 48px × 48px

Status Option Button:
• Height: ~80px (with padding)
• Width: 100% (full width)
• Padding: 20px all sides

Icon Container:
• Size: 48px × 48px
• Centered icon: 24px
```

## 🎭 States

### Default State
```
┌─────────────────────────────────────┐
│  ┌──────┐                           │
│  │  ✗   │  Missed                   │
│  └──────┘  Forgot to take medicine  │
└─────────────────────────────────────┘

Border: 2px solid border color
Background: Surface Secondary
Opacity: 1.0
```

### Current State
```
┌─────────────────────────────────────┐
│  ┌──────┐                 ┌───────┐ │
│  │  ✓   │  Taken          │Current│ │
│  └──────┘  Medicine was   └───────┘ │
│             consumed                │
└─────────────────────────────────────┘

Border: 2px solid status color
Background: Status color 20%
Opacity: 0.6 (disabled)
Badge: Visible
```

### Pressed State
```
Active Opacity: 0.7
Visual feedback on touch
```

## 🎨 Icon Specifications

### Status Icons
```
Taken:   checkmark-circle
Missed:  close-circle
Skipped: remove-circle
```

### UI Icons
```
Medicine:  medical
Clock:     time-outline
Close:     close
```

### Icon Sizes
```
Status Icons:     24px
Container Icons:  24px (in 48px container)
UI Icons:         16-20px
```

## 📐 Layout Grid

```
Modal Width: 90% of screen width (max 400px)

┌─────────────────────────────────────┐
│ [20px padding]                      │
│                                     │
│  Dose Details Card                  │
│  • 20px padding                     │
│  • 16px internal spacing            │
│                                     │
│ [16px gap]                          │
│                                     │
│  Divider (1px)                      │
│                                     │
│ [16px gap]                          │
│                                     │
│  Title                              │
│                                     │
│ [8px gap]                           │
│                                     │
│  Status Options                     │
│  • 16px gap between options         │
│  • 20px padding each                │
│                                     │
│ [20px padding]                      │
└─────────────────────────────────────┘
```

## 🎯 Visual Hierarchy

### Level 1: Medicine Name
```
Size: XL (20px)
Weight: Bold
Color: Primary Text
Purpose: Main identification
```

### Level 2: Status Options
```
Size: Base (16px)
Weight: Semibold
Color: Primary Text
Purpose: Action choices
```

### Level 3: Dosage & Time
```
Size: Base/SM (16px/14px)
Weight: Regular
Color: Secondary Text
Purpose: Supporting info
```

### Level 4: Descriptions
```
Size: XS (12px)
Weight: Regular
Color: Secondary Text
Purpose: Helper text
```

## 🌈 Color Contrast Ratios

### Light Mode
```
Text on Background:     21:1 (AAA)
Secondary on BG:        7:1 (AA)
Status Colors:          4.5:1+ (AA)
```

### Dark Mode
```
Text on Background:     18:1 (AAA)
Secondary on BG:        6:1 (AA)
Status Colors:          4.5:1+ (AA)
```

## ✨ Animation Specs

### Button Press
```
Duration: 150ms
Easing: ease-out
Property: opacity
From: 1.0
To: 0.7
```

### Modal Open/Close
```
Duration: 300ms
Easing: ease-in-out
Property: opacity, scale
```

## 📊 Responsive Breakpoints

### Small Devices (< 375px)
```
• Reduce padding to 16px
• Smaller icon containers (40px)
• Adjust font sizes down 1 step
```

### Medium Devices (375px - 768px)
```
• Standard sizing (as specified)
• Optimal touch targets
```

### Large Devices (> 768px)
```
• Max modal width: 400px
• Centered on screen
• Same sizing as medium
```

## 🎨 Design Tokens Reference

```typescript
// Spacing
Spacing.xs = 4
Spacing.sm = 8
Spacing.md = 16
Spacing.lg = 20
Spacing.xl = 24

// Border Radius
BorderRadius.sm = 4
BorderRadius.md = 8
BorderRadius.lg = 12
BorderRadius.full = 9999

// Typography
Typography.fontSize.xs = 12
Typography.fontSize.sm = 14
Typography.fontSize.base = 16
Typography.fontSize.lg = 18
Typography.fontSize.xl = 20
Typography.fontSize['2xl'] = 24

Typography.fontWeight.regular = '400'
Typography.fontWeight.medium = '500'
Typography.fontWeight.semibold = '600'
Typography.fontWeight.bold = '700'
```

---

This design system ensures consistency, accessibility, and a beautiful user experience across all devices and color modes! 🎨✨

