# Next Dose Display Fix

## 🎯 Issue
The medicine details page was not showing the next scheduled dose information, making it difficult for users to know when they need to take their next dose.

## ✅ Solution
Added a prominent "Next Dose" card that displays:
- The date of the next dose (Today/Tomorrow/specific date)
- The time of the next dose
- How long until the next dose (countdown)

---

## 🎨 UI Implementation

### Next Dose Card
A new card is displayed at the top of the medicine details page (after the header, before dosage information):

```
┌─────────────────────────────────┐
│ 🔔 Next Dose                    │  ← Header with alarm icon
│                                 │
│         Today                   │  ← Date (Today/Tomorrow/Date)
│        2:30 PM                  │  ← Large, bold time
│      ┌──────────┐               │
│      │ in 2h 15m │              │  ← Countdown badge
│      └──────────┘               │
└─────────────────────────────────┘
```

**Visual Features:**
- **Left border**: 4px primary color accent
- **Alarm icon**: Visual indicator for scheduled dose
- **Centered layout**: Easy to scan
- **Large time display**: 3xl font size for prominence
- **Badge**: Countdown in a colored badge
- **Primary color theme**: Consistent with app design

---

## 🔧 Technical Implementation

### 1. Next Dose Calculation (`getNextScheduledDose`)

The function calculates the next scheduled dose by:

#### For Daily Schedules
```typescript
// Check if time is later today
if (scheduleTime > currentTime) {
  // Next dose is today
} else {
  // Next dose is tomorrow
}
```

#### For Specific Days Schedules
```typescript
// 1. Check if today is a scheduled day and time hasn't passed
if (days.includes(currentDay) && scheduleTime > currentTime) {
  // Next dose is today
}

// 2. Check next 7 days for the next scheduled day
for (let i = 1; i <= 7; i++) {
  const checkDay = (currentDay + i) % 7;
  if (days.includes(checkDay)) {
    // Found next scheduled day
    break;
  }
}
```

#### For Interval-Based Schedules
Currently skipped in the calculation (complex logic). These schedules show in the schedule section but not in "Next Dose" card.

**Algorithm:**
1. Get current time and day
2. Iterate through all schedules
3. For each schedule, calculate next occurrence
4. Track the earliest next dose
5. Return the soonest upcoming dose

### 2. Time Formatting (`formatNextDoseTime`)

Formats the next dose information into user-friendly text:

```typescript
{
  dateStr: "Today" | "Tomorrow" | "Mon, Jan 15",
  timeStr: "2:30 PM",
  timeUntil: "in 2h 15m" | "in 45m"
}
```

**Date Display Logic:**
- **Today**: If next dose is today
- **Tomorrow**: If next dose is tomorrow
- **Specific Date**: "Mon, Jan 15" format for future dates

**Time Until Display:**
- Shows hours and minutes if > 1 hour: "in 2h 15m"
- Shows only minutes if < 1 hour: "in 45m"
- Real-time countdown (updates on component refresh)

### 3. UI Component

```typescript
{nextDoseFormatted && (
  <Card style={styles.nextDoseCard}>
    <View style={styles.nextDoseHeader}>
      <Ionicons name="alarm" size={24} color={colors.primary} />
      <Text style={styles.nextDoseTitle}>Next Dose</Text>
    </View>
    <View style={styles.nextDoseContent}>
      <Text style={styles.nextDoseDate}>{dateStr}</Text>
      <Text style={styles.nextDoseTime}>{timeStr}</Text>
      <View style={styles.nextDoseBadge}>
        <Text style={styles.nextDoseTimeUntil}>{timeUntil}</Text>
      </View>
    </View>
  </Card>
)}
```

---

## 📊 Examples

### Example 1: Next Dose Today
```
┌─────────────────────────────────┐
│ 🔔 Next Dose                    │
│                                 │
│         Today                   │
│        2:30 PM                  │
│      ┌──────────┐               │
│      │ in 2h 15m │              │
│      └──────────┘               │
└─────────────────────────────────┘
```

### Example 2: Next Dose Tomorrow
```
┌─────────────────────────────────┐
│ 🔔 Next Dose                    │
│                                 │
│        Tomorrow                 │
│        9:00 AM                  │
│      ┌──────────┐               │
│      │ in 18h 30m│              │
│      └──────────┘               │
└─────────────────────────────────┘
```

### Example 3: Next Dose Future Date
```
┌─────────────────────────────────┐
│ 🔔 Next Dose                    │
│                                 │
│     Mon, Jan 15                 │
│        8:00 AM                  │
│      ┌──────────┐               │
│      │ in 3d 12h │              │
│      └──────────┘               │
└─────────────────────────────────┘
```

### Example 4: No Next Dose
If no schedules exist, the card is not displayed.

---

## 🎨 Styling Details

### Card Styles
```typescript
nextDoseCard: {
  marginBottom: Spacing.md,
  borderLeftWidth: 4,              // Accent border
  borderLeftColor: Colors.light.primary,
}
```

### Header Styles
```typescript
nextDoseHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: Spacing.sm,
  marginBottom: Spacing.md,
}

nextDoseTitle: {
  fontSize: Typography.fontSize.lg,
  fontWeight: Typography.fontWeight.semibold,
}
```

### Content Styles
```typescript
nextDoseContent: {
  alignItems: "center",           // Centered layout
  gap: Spacing.sm,
}

nextDoseDate: {
  fontSize: Typography.fontSize.base,
  fontWeight: Typography.fontWeight.medium,
}

nextDoseTime: {
  fontSize: Typography.fontSize["3xl"],  // Large, prominent
  fontWeight: Typography.fontWeight.bold,
}

nextDoseBadge: {
  paddingHorizontal: Spacing.md,
  paddingVertical: Spacing.sm,
  borderRadius: 20,                // Pill shape
  marginTop: Spacing.xs,
  backgroundColor: `${colors.primary}15`,  // 15% opacity
}

nextDoseTimeUntil: {
  fontSize: Typography.fontSize.sm,
  fontWeight: Typography.fontWeight.semibold,
}
```

---

## 🔄 Schedule Type Support

### ✅ Supported
1. **Daily Schedules**: Doses at specific times every day
2. **Specific Days Schedules**: Doses on certain days of the week (e.g., Mon, Wed, Fri)

### ⚠️ Partially Supported
3. **Interval-Based Schedules**: Currently not shown in "Next Dose" card
   - Still visible in the "Schedule" section
   - Complex to calculate next occurrence without dose history
   - Future enhancement opportunity

---

## 🎯 User Benefits

### Before
- ❌ No clear indication of next dose
- ❌ Had to manually calculate from schedule times
- ❌ Had to remember which day is next for weekly schedules
- ❌ Difficult to plan around medication times

### After
- ✅ Clear, prominent next dose display
- ✅ Automatic calculation of next occurrence
- ✅ Countdown timer shows urgency
- ✅ Easy to plan day around medication
- ✅ Reduces missed doses

---

## 📱 Placement

The "Next Dose" card is strategically placed:

1. **After**: Medicine header (name, type, icon)
2. **Before**: Dosage information
3. **Reason**: Most important information first

**Page Structure:**
```
┌─────────────────────────────────┐
│ Medicine Header                 │  ← Name, icon, type
├─────────────────────────────────┤
│ Next Dose Card                  │  ← NEW: Most important
├─────────────────────────────────┤
│ Dosage Information              │
├─────────────────────────────────┤
│ Schedule                        │
├─────────────────────────────────┤
│ Notes                           │
├─────────────────────────────────┤
│ Statistics                      │
├─────────────────────────────────┤
│ Dose History                    │
└─────────────────────────────────┘
```

---

## 🧪 Testing Scenarios

### Test Case 1: Daily Schedule
**Setup**: Medicine with daily schedule at 9:00 AM and 9:00 PM
**Current Time**: 10:00 AM
**Expected**: Shows "Today, 9:00 PM, in 11h 0m"

### Test Case 2: Specific Days Schedule
**Setup**: Medicine on Mon, Wed, Fri at 8:00 AM
**Current Time**: Monday 10:00 AM
**Expected**: Shows "Wed, Jan 17, 8:00 AM, in 2d 22h"

### Test Case 3: Multiple Schedules
**Setup**: Two schedules - 8:00 AM and 6:00 PM daily
**Current Time**: 10:00 AM
**Expected**: Shows "Today, 6:00 PM, in 8h 0m" (earliest next dose)

### Test Case 4: Past All Today's Doses
**Setup**: Daily schedule at 9:00 AM
**Current Time**: 10:00 PM
**Expected**: Shows "Tomorrow, 9:00 AM, in 11h 0m"

### Test Case 5: No Schedule
**Setup**: Medicine with no schedules
**Expected**: Card is not displayed

---

## 🔄 Real-Time Updates

The next dose information updates when:
1. **Screen focus**: When user navigates to the medicine details page
2. **After edit**: When user edits the medicine and returns
3. **Manual refresh**: Pull-to-refresh (if implemented)

**Note**: The countdown doesn't update automatically while viewing. User needs to navigate away and back to see updated countdown.

**Future Enhancement**: Add real-time countdown with `setInterval` or similar.

---

## 🎨 Color Mode Support

### Light Mode
- **Border**: Primary color (`#4F46E5`)
- **Icon**: Primary color
- **Time**: Primary color (bold)
- **Badge Background**: Primary with 15% opacity
- **Badge Text**: Primary color

### Dark Mode
- **Border**: Primary color (`#6366F1`)
- **Icon**: Primary color
- **Time**: Primary color (bold)
- **Badge Background**: Primary with 15% opacity
- **Badge Text**: Primary color

**Automatic Adaptation**: Uses `useColorScheme()` hook to detect mode.

---

## 📊 Edge Cases Handled

### 1. No Schedules
- Card is not displayed
- No error or empty state needed

### 2. Multiple Schedules Same Time
- Shows the first one found
- Both will have same next dose anyway

### 3. Schedule in Past (Today)
- Correctly calculates next occurrence (tomorrow or next scheduled day)

### 4. Week Wraparound
- Handles Sunday (0) to Saturday (6) correctly
- Uses modulo operator for week wraparound

### 5. Invalid Schedule Data
- Try-catch blocks prevent crashes
- Logs errors to console
- Skips invalid schedules

---

## 🚀 Future Enhancements

### Potential Improvements
1. **Real-time Countdown**: Update countdown every minute
2. **Interval Schedule Support**: Calculate next dose for interval-based schedules
3. **Quick Actions**: "Mark as Taken" button on the card
4. **Notification Preview**: Show if notification is set
5. **Multiple Next Doses**: Show next 2-3 upcoming doses
6. **Visual Countdown**: Progress bar or circular timer
7. **Color Coding**: Red for overdue, yellow for soon, green for later

---

## 📝 Summary

### Changes Made
✅ Added `getNextScheduledDose()` function to calculate next dose
✅ Added `formatNextDoseTime()` function to format display
✅ Created prominent "Next Dose" card UI component
✅ Added styles for the new card
✅ Positioned card strategically (top of page)
✅ Supports daily and specific days schedules
✅ Shows date, time, and countdown
✅ Color mode aware
✅ Handles edge cases gracefully

### Benefits
✅ **Clear visibility**: Users immediately see when next dose is due
✅ **Better planning**: Countdown helps users plan their day
✅ **Reduced missed doses**: Prominent display serves as reminder
✅ **Professional UI**: Well-designed, consistent with app style
✅ **Smart calculation**: Automatically finds next occurrence

The medicine details page now provides clear, actionable information about when the next dose is scheduled! 🎉

