# Medicine Tracker App - Implementation Plan

## Architecture Overview

**Local-First Approach:**

- SQLite database for all data storage using `expo-sqlite`
- Data models designed for future sync (timestamps, sync flags, UUIDs)
- Background tasks with `expo-task-manager` and `expo-background-fetch`
- Full-screen notifications using `expo-notifications` with custom native modules
- State management with React Context + AsyncStorage for app preferences

## Database Schema Design

Create SQLite schema with these tables:

- **users**: id, name, email, phone, profile_image, created_at, updated_at
- **medicines**: id, user_id, name, type (pill/liquid/injection/inhaler/drops), dosage, unit, frequency, start_date, end_date, notes, image, created_at, updated_at, sync_flag
- **schedules**: id, medicine_id, time, days_of_week, is_active, created_at, updated_at
- **doses**: id, medicine_id, schedule_id, scheduled_time, taken_time, status (taken/missed/skipped), notes, created_at
- **medicine_groups**: id, name, description, created_at (for future sharing)
- **medicine_group_members**: id, group_id, medicine_id, created_at
- **emergency_contacts**: id, user_id, name, relationship, phone, email, priority, created_at
- **shared_users**: id, medicine_id, shared_with_user, permissions, created_at (placeholder for future)
- **notification_settings**: id, user_id, enabled, sound, vibration, full_screen_enabled, remind_before_minutes, remind_after_missed_minutes

## Implementation Steps

### 1. Project Dependencies & Setup

Install required packages:

```bash
npx expo install expo-sqlite expo-notifications expo-task-manager expo-background-fetch
npx expo install @react-native-async-storage/async-storage expo-image-picker
npx expo install expo-haptics expo-device expo-linear-gradient
npx expo install react-native-reanimated react-native-gesture-handler
npx expo install @react-native-community/datetimepicker
```

Configure [`app.json`](app.json) with required permissions:

- Notifications, background fetch, image picker, full-screen intent

### 2. Core Database Layer

**Create:** `lib/database/schema.ts`

- SQL table creation statements
- Migration system for future updates
- Database initialization function

**Create:** `lib/database/operations.ts`

- Generic CRUD operations
- Transaction support
- Prepared statements for queries

**Create:** `lib/database/models/` directory:

- `medicine.ts`: Medicine CRUD operations
- `schedule.ts`: Schedule management
- `dose.ts`: Dose tracking and history
- `user.ts`: User profile management
- `emergency-contact.ts`: Emergency contact CRUD
- `notification-settings.ts`: Notification preferences

### 3. Medicine Management (Core Feature)

**Create:** `app/(tabs)/medicines/` directory structure:

- `index.tsx`: Medicine list with search/filter (by type, status, upcoming)
- `[id].tsx`: Medicine detail view with schedule and history
- `add.tsx`: Add new medicine form
- `edit/[id].tsx`: Edit medicine form

**Medicine form fields:**

- Name, type (dropdown), dosage + unit
- Frequency options: daily, specific days, interval (every X hours)
- Time picker for each dose
- Start/end dates
- Photo upload capability
- Notes/instructions
- Color coding option

**Create:** `components/medicine/` directory:

- `MedicineCard.tsx`: Display medicine with next dose time
- `MedicineTypeIcon.tsx`: Icons for different medicine types
- `SchedulePicker.tsx`: Custom schedule configuration UI
- `DoseHistoryList.tsx`: History of taken/missed doses

### 4. Notification System

**Create:** `lib/notifications/` directory:

- `setup.ts`: Initialize notifications, request permissions
- `scheduler.ts`: Schedule notifications based on medicine schedules
- `handlers.ts`: Handle notification responses (taken/snooze/missed)
- `full-screen.ts`: Custom full-screen notification implementation

**Full-Screen Notification Approach:**

- Create custom notification category with `fullScreenIntent`
- Native module for Android (Kotlin) to launch full-screen activity
- iOS: Use high-priority with critical alerts
- Design full-screen UI: `app/notification-screen.tsx`
  - Large medicine name and dosage
  - Quick action buttons (Take, Snooze 10min, Skip)
  - Auto-dismiss timer
  - Haptic feedback on actions

**Background Task:**

- Register task to check upcoming doses every 15 minutes
- Reschedule notifications if app was closed
- Update missed dose status
- Sync future backend changes (placeholder)

### 5. Home Screen Dashboard

**Update:** [`app/(tabs)/index.tsx`](app/index.tsx) to show:

**Today's Progress Section:**

- Circular progress indicator (doses taken / total scheduled)
- Percentage completion
- Animated progress ring with gradient

**Upcoming Doses (Next 24 hours):**

- Timeline view of upcoming medicines
- Color-coded by urgency (overdue=red, <30min=orange, upcoming=green)
- Quick "Mark as Taken" button
- Swipe actions for snooze/skip

**Quick Stats:**

- Current streak (days without missed doses)
- Weekly adherence rate
- Active medicines count

**Recent Activity:**

- Last 5 dose activities with timestamps
- Filter: all/taken/missed/skipped

### 6. Progress & History Screen

**Create:** `app/(tabs)/history.tsx`:

**Calendar View:**

- Month calendar with color-coded days (good/partial/missed)
- Tap day to see detailed dose list

**Statistics:**

- Weekly/Monthly adherence charts
- Medicine-wise breakdown
- Time-of-day patterns (best/worst compliance)
- Export report as PDF/CSV (future)

**Charts:** Use simple custom SVG or lightweight charting library

### 7. User Profile & Settings

**Create:** `app/(tabs)/profile.tsx`:

**Profile Section:**

- Profile photo upload
- Name, email, phone
- Edit profile button

**Emergency Contacts:**

- List of contacts with call/message quick actions
- Add/Edit/Delete contacts
- Set primary contact

**Notification Settings:**

- Enable/disable notifications toggle
- Sound selection
- Vibration pattern
- Full-screen notification toggle
- Reminder timing (before dose, after missed)
- Snooze duration options
- Do Not Disturb schedule

**App Settings:**

- Theme (light/dark/auto)
- Language (future)
- Data backup/restore (export/import JSON)
- Clear all data option

### 8. Medicine Groups & Sharing (Structure Only)

**Create:** `app/(tabs)/groups.tsx`:

- List of medicine groups
- "Share" button (shows "Coming Soon" modal for now)
- Group creation UI (functional for local grouping)

**Prepare data structure:**

- Group CRUD operations in database
- Placeholder for sharing API integration
- UI structure ready for adding shared users

### 9. UI/UX Design System

**Create:** `constants/design.ts`:

- Color palette (primary, secondary, success, warning, danger, neutral)
- Typography scale
- Spacing system
- Border radius values
- Shadow styles

**Create:** `components/ui/` directory:

- `Button.tsx`: Primary, secondary, ghost variants
- `Card.tsx`: Elevated card component
- `Input.tsx`: Text input with label and error states
- `Select.tsx`: Dropdown selector
- `Modal.tsx`: Bottom sheet modal
- `ProgressRing.tsx`: Animated circular progress
- `Timeline.tsx`: Vertical timeline component
- `EmptyState.tsx`: Friendly empty states with illustrations
- `LoadingSpinner.tsx`: Loading indicator

**Design Principles:**

- Clean, minimal interface
- Large tap targets (min 44x44)
- Smooth animations (Reanimated)
- Haptic feedback on interactions
- Consistent spacing and typography
- Accessible color contrasts
- Clear visual hierarchy

### 10. Navigation Structure

Update [`app/_layout.tsx`](app/_layout.tsx) for root layout

**Create:** `app/(tabs)/_layout.tsx` with tabs:

- Home (dashboard icon)
- Medicines (pill icon)
- History (chart icon)
- Groups (users icon)
- Profile (person icon)

**Stack navigators for each tab:**

- Medicines: list → detail → add/edit
- Profile: main → emergency contacts → settings

### 11. Onboarding Flow

**Create:** `app/onboarding/` directory:

- `welcome.tsx`: App introduction
- `permissions.tsx`: Request notification permissions
- `profile-setup.tsx`: Basic profile creation
- `first-medicine.tsx`: Guide to add first medicine

**Flow:** Show only on first launch, skip button available

### 12. Error Handling & Edge Cases

- Database transaction failures
- Notification permission denied (graceful degradation)
- Invalid medicine data
- Scheduling conflicts
- App killed while notifications pending
- Timezone changes
- Date/time boundary edge cases (midnight, DST)

### 13. Performance Optimizations

- Lazy load medicine images
- Paginate dose history
- Memoize heavy calculations
- Optimize SQLite queries with indexes
- Debounce search inputs
- Virtualize long lists
- Background task optimization (battery-friendly)

### 14. Testing Considerations

While implementation, manually test:

- Add medicine → Receive notification → Mark as taken
- Miss a dose → Check history updates
- Background app → Notifications still work
- Device restart → Notifications reschedule
- Multiple medicines at same time
- Edit medicine with active schedule
- Delete medicine with history

## File Structure Summary

```
/app
  /(tabs)
    /medicines
      index.tsx (list)
      [id].tsx (detail)
      add.tsx
      /edit
        [id].tsx
    /groups
      index.tsx
    /history
      index.tsx
    index.tsx (home/dashboard)
    profile.tsx
    _layout.tsx
  /onboarding
    welcome.tsx
    permissions.tsx
    profile-setup.tsx
    first-medicine.tsx
  notification-screen.tsx
  _layout.tsx
/components
  /medicine
    MedicineCard.tsx
    MedicineTypeIcon.tsx
    SchedulePicker.tsx
    DoseHistoryList.tsx
  /ui
    Button.tsx
    Card.tsx
    Input.tsx
    Select.tsx
    Modal.tsx
    ProgressRing.tsx
    Timeline.tsx
    EmptyState.tsx
    LoadingSpinner.tsx
/lib
  /database
    schema.ts
    operations.ts
    /models
      medicine.ts
      schedule.ts
      dose.ts
      user.ts
      emergency-contact.ts
      notification-settings.ts
      groups.ts
  /notifications
    setup.ts
    scheduler.ts
    handlers.ts
    full-screen.ts
  /utils
    date-helpers.ts
    validation.ts
  /hooks
    useMedicines.ts
    useSchedules.ts
    useDoses.ts
    useNotifications.ts
/constants
  design.ts
  theme.ts (existing)
/types
  database.ts
  medicine.ts
  notification.ts
```

## Future Backend Integration Points

When backend is ready, modify:

1. Add sync functions in `lib/database/sync.ts`
2. Add API client in `lib/api/client.ts`
3. Add authentication flow in `app/(auth)/`
4. Update models to handle sync conflicts
5. Add real-time listeners for shared medicines
6. Implement push notifications for shared users
7. Add websocket for real-time updates

The local-first architecture ensures the app works perfectly offline and will seamlessly add sync capabilities later.
