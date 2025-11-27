# Missing Features - Medicine Tracker App

This document lists all features from the original plan that are not yet implemented or only partially implemented.

## Status Legend
- ❌ **Not Implemented** - Feature completely missing
- ⚠️ **Partially Implemented** - Basic structure exists but incomplete
- ✅ **Implemented** - Feature fully working

---

## 1. Medicine Management

### ❌ Schedule Picker Component
**File:** `components/medicine/SchedulePicker.tsx`

**Missing:**
- Visual day-of-week picker (checkboxes for Mon-Sun)
- Interval hours selector with validation
- Multiple time slots per medicine (e.g., 3 times daily at different times)
- Visual schedule preview

**Current State:** Simple text input for time only

**Priority:** High - Core feature for proper scheduling

---

### ❌ Dose History List Component
**File:** `components/medicine/DoseHistoryList.tsx`

**Missing:**
- Dedicated component showing dose history
- Filter by status (taken/missed/skipped)
- Pagination for long histories
- Visual timeline of doses

**Current State:** Not implemented

**Priority:** Medium - Useful for tracking compliance

---

### ❌ Medicine Image Upload
**Dependencies:** `expo-image-picker` (already installed)

**Missing:**
- Camera capture functionality
- Gallery selection
- Image preview in forms
- Image display in medicine cards
- Image storage in database
- Image compression/optimization

**Current State:** Database has `image` field but no UI

**Priority:** Low - Nice to have feature

---

### ❌ Medicine Color Coding
**Missing:**
- Color picker in add/edit forms
- Custom color selection (not just type-based)
- Color display in medicine cards
- Color-based filtering/grouping

**Current State:** Database has `color` field, only type-based colors used

**Priority:** Low - Visual enhancement

---

## 2. Advanced Scheduling

### ⚠️ Interval-Based Scheduling
**Missing:**
- UI to input interval hours
- Notification scheduling logic for intervals
- Display interval in medicine detail

**Current State:** Database schema supports it, no UI implementation

**Priority:** High - Mentioned in requirements

---

### ⚠️ Specific Days Selection
**Missing:**
- Day-of-week picker UI
- Logic to schedule only on selected days
- Display selected days in medicine detail

**Current State:** Database supports JSON array of days, no UI

**Priority:** High - Common use case

---

### ❌ Multiple Times Per Day
**Missing:**
- Support for multiple schedules per medicine
- UI to add/remove time slots
- Proper notification scheduling for multiple times

**Current State:** Only one schedule per medicine supported

**Priority:** High - Many medicines taken multiple times daily

---

## 3. Notification System

### ❌ Remind Before Dose
**Missing:**
- UI to set reminder minutes before dose
- Notification scheduling X minutes before
- Different notification text for "upcoming" vs "now"

**Current State:** Database field exists, not implemented

**Priority:** Medium - Helpful reminder feature

---

### ❌ Remind After Missed Dose
**Missing:**
- UI to set reminder minutes after missed
- Background check for missed doses
- Follow-up notification scheduling

**Current State:** Database field exists, not implemented

**Priority:** Medium - Important for adherence

---

### ❌ Do Not Disturb Schedule
**Missing:**
- UI to set quiet hours (e.g., 10 PM - 7 AM)
- Logic to suppress notifications during DND
- Option to allow critical medicines through DND

**Current State:** Not implemented

**Priority:** Medium - User comfort feature

---

### ❌ Custom Snooze Duration
**Missing:**
- UI to select snooze duration (5/10/15/30 min)
- Save preference in settings
- Use custom duration in snooze logic

**Current State:** Hardcoded to 10 minutes

**Priority:** Low - Nice to have

---

### ❌ Sound Selection
**Missing:**
- List of available notification sounds
- Sound preview functionality
- Apply selected sound to notifications

**Current State:** Shows "Default" but can't change

**Priority:** Low - Personalization feature

---

### ⚠️ Full-Screen Notification Native Module
**Missing:**
- Android Kotlin native module for true full-screen intent
- iOS critical alerts with proper permissions
- System-level full-screen notification (not modal)

**Current State:** Uses modal presentation, works but not true full-screen

**Priority:** Medium - Better user experience

---

### ⚠️ Notification Rescheduling
**File:** `lib/notifications/scheduler.ts` - `rescheduleAllNotifications()`

**Missing:**
- Logic to get all active medicines
- Schedule next 7 days for each medicine
- Handle app restart scenario
- Efficient bulk scheduling

**Current State:** Placeholder function only

**Priority:** High - Critical for reliability

---

## 4. History & Statistics

### ❌ Calendar View
**Missing:**
- Month calendar component
- Color-coded days (green=good, yellow=partial, red=missed)
- Tap day to see dose list for that day
- Navigate between months

**Current State:** Only shows today's doses

**Priority:** High - Key feature in plan

---

### ❌ Charts and Visualizations
**Missing:**
- Weekly adherence line/bar chart
- Monthly adherence chart
- Medicine-wise breakdown (pie/bar chart)
- Time-of-day patterns chart
- Lightweight charting library integration

**Current State:** Only text-based statistics

**Priority:** Medium - Visual insights valuable

---

### ❌ Streak Calculation
**File:** `lib/hooks/useDoses.ts`

**Missing:**
- Logic to calculate consecutive days without missed doses
- Handle edge cases (no doses scheduled on some days)
- Display streak prominently

**Current State:** Shows `0` as placeholder

**Priority:** Medium - Motivational feature

---

### ❌ Export Reports
**Missing:**
- Generate PDF report with statistics
- Export data as CSV
- Email/share report functionality

**Current State:** Button exists but not functional

**Priority:** Low - Advanced feature

---

## 5. Profile & Settings

### ❌ Edit Profile
**Missing:**
- Edit profile form
- Update name, email, phone
- Profile photo upload/change
- Form validation
- Save changes to database

**Current State:** Button shows "Coming Soon" alert

**Priority:** Medium - Basic user management

---

### ❌ Profile Photo Upload
**Dependencies:** `expo-image-picker` (already installed)

**Missing:**
- Camera/gallery picker for profile photo
- Image cropping/resizing
- Save to database
- Display in profile header

**Current State:** Shows initial-based avatar only

**Priority:** Low - Visual enhancement

---

### ❌ Emergency Contacts Management
**Missing:**
- Add contact form (name, relationship, phone, email, priority)
- Edit contact functionality
- Delete contact with confirmation
- Call functionality (using `Linking.openURL`)
- SMS functionality (using `Linking.openURL`)

**Current State:** Shows list but no CRUD operations

**Priority:** Medium - Safety feature

---

### ❌ Theme Selection
**Missing:**
- Theme picker UI (Light/Dark/Auto)
- Save preference to AsyncStorage
- Apply selected theme
- Override system theme when manual selection

**Current State:** Only follows system theme

**Priority:** Low - User preference

---

### ❌ Data Backup/Restore
**Missing:**
- Export all data as JSON
- Import data from JSON file
- Validation on import
- Merge or replace options
- File picker integration

**Current State:** Button shows "Coming Soon" alert

**Priority:** Medium - Data safety

---

## 6. Medicine Groups

### ❌ Create Group
**Missing:**
- Create group form (name, description)
- Form validation
- Save to database
- Success feedback

**Current State:** Button shows "Coming Soon" alert

**Priority:** Low - Organizational feature

---

### ❌ Group Management
**Missing:**
- Add medicines to group (multi-select)
- Remove medicines from group
- Edit group details
- Delete group with confirmation
- View group members

**Current State:** Database structure exists, no UI

**Priority:** Low - Organizational feature

---

### ❌ Sharing Features (Future)
**Note:** Intentionally left for future backend implementation

**Missing:**
- Share group with other users
- Accept/reject share invitations
- Permissions management (view/edit)
- Real-time sync of shared medicines
- Notifications for shared medicine events

**Current State:** Database tables exist, marked as "Coming Soon"

**Priority:** Future - Requires backend

---

## 7. Search & Filter

### ❌ Medicine Search
**Missing:**
- Search input in medicine list
- Search by name (real-time)
- Clear search button
- Search results count

**Current State:** Shows all medicines

**Priority:** Medium - Useful with many medicines

---

### ❌ Medicine Filters
**Missing:**
- Filter by type (pill, liquid, etc.)
- Filter by status (active, inactive)
- Filter by upcoming dose
- Multiple filter selection
- Filter chips/tags display

**Current State:** No filtering available

**Priority:** Medium - Better organization

---

## 8. User Experience Enhancements

### ❌ Swipe Actions
**Missing:**
- Swipe left/right on dose items
- Quick actions (Take, Skip, Snooze)
- Haptic feedback on swipe
- Visual swipe indicators

**Current State:** Static list items

**Priority:** Low - UX improvement

---

### ⚠️ Enhanced Onboarding
**Current State:** Basic 4-step onboarding exists

**Missing:**
- Separate permission request screen with explanation
- Profile setup screen (name, email, phone)
- First medicine guide (step-by-step)
- Skip individual steps option

**Priority:** Low - Current onboarding is functional

---

### ❌ Pagination
**Missing:**
- Paginate dose history (load more)
- Paginate medicine list (if many medicines)
- Infinite scroll or "Load More" button

**Current State:** Loads all data at once

**Priority:** Low - Performance optimization

---

### ❌ Pull-to-Refresh Enhancements
**Current State:** Basic refresh on some screens

**Missing:**
- Consistent refresh on all list screens
- Visual feedback during refresh
- Error handling on refresh failure

**Priority:** Low - Minor UX improvement

---

## 9. Error Handling & Edge Cases

### ⚠️ Timezone Handling
**Missing:**
- Detect timezone changes
- Reschedule notifications on timezone change
- Display times in user's current timezone
- DST (Daylight Saving Time) transitions

**Current State:** Uses device timezone, no change detection

**Priority:** Medium - Important for travelers

---

### ❌ Offline Indicator
**Missing:**
- Show offline status (for future backend)
- Queue sync operations when offline
- Retry failed syncs

**Current State:** Always offline (no backend)

**Priority:** Future - For backend integration

---

### ❌ Validation Improvements
**Missing:**
- More comprehensive form validation
- Async validation (check duplicates)
- Better error messages
- Field-level validation feedback

**Current State:** Basic validation exists

**Priority:** Low - Current validation works

---

## 10. Performance Optimizations

### ❌ Image Lazy Loading
**Missing:**
- Lazy load medicine images
- Image caching strategy
- Placeholder while loading

**Current State:** No images implemented yet

**Priority:** Low - Depends on image feature

---

### ❌ List Virtualization
**Missing:**
- Use FlatList with virtualization
- Optimize large lists (100+ medicines)
- Window size optimization

**Current State:** Uses ScrollView (fine for small lists)

**Priority:** Low - Only needed with many items

---

### ❌ Database Query Optimization
**Missing:**
- Add more indexes for common queries
- Optimize complex joins
- Query performance monitoring

**Current State:** Basic indexes exist

**Priority:** Low - Current performance is good

---

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ Multiple times per day scheduling
2. ✅ Specific days selection UI
3. ✅ Interval-based scheduling UI
4. ✅ Calendar view in history
5. ✅ Notification rescheduling logic
6. ✅ Schedule picker component

### Medium Priority (Important Features)
1. Edit profile functionality
2. Emergency contacts management
3. Search and filter medicines
4. Dose history component
5. Charts and visualizations
6. Streak calculation
7. Timezone handling
8. Remind before/after dose

### Low Priority (Nice to Have)
1. Medicine image upload
2. Color coding
3. Theme selection
4. Swipe actions
5. Custom snooze duration
6. Sound selection
7. Data backup/restore
8. Medicine groups
9. Performance optimizations

### Future (Backend Required)
1. Sharing features
2. Real-time sync
3. Push notifications for shared medicines
4. Cloud backup

---

## Notes

- The app is **fully functional** for core medicine tracking use cases
- Most missing features are **enhancements** rather than critical functionality
- The architecture is **ready** for all these features to be added
- Database schema **supports** most missing features already
- Focus on **high priority** items for production release

---

**Last Updated:** November 27, 2024
**Total Features Planned:** ~60
**Fully Implemented:** ~36 (60%)
**Partially Implemented:** ~9 (15%)
**Not Implemented:** ~15 (25%)

