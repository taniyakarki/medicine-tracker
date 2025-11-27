# Dose Actions - Architecture & Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE LAYER                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │   Home Screen    │         │  History Screen  │          │
│  │   (index.tsx)    │         │  (history.tsx)   │          │
│  ├──────────────────┤         ├──────────────────┤          │
│  │ • Upcoming       │         │ • Date Filter    │          │
│  │ • Past Pending   │         │ • Dose List      │          │
│  │ • Take/Skip      │         │ • Status Modal   │          │
│  │ • Stats Display  │         │ • Edit Actions   │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
└───────────┼────────────────────────────┼─────────────────────┘
            │                            │
            └──────────┬─────────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   COMPONENT LAYER                            │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │  Timeline.tsx    │    │   Modal.tsx      │               │
│  ├──────────────────┤    ├──────────────────┤               │
│  │ • Dose Cards     │    │ • Status Change  │               │
│  │ • Action Buttons │    │ • Dose Details   │               │
│  │ • Status Icons   │    │ • Confirmation   │               │
│  └────────┬─────────┘    └────────┬─────────┘               │
│           │                       │                          │
└───────────┼───────────────────────┼──────────────────────────┘
            │                       │
            └──────────┬────────────┘
                       │
┌──────────────────────▼──────────────────────────────────────┐
│                   BUSINESS LOGIC LAYER                       │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐            │
│  │         lib/database/models/dose.ts          │            │
│  ├──────────────────────────────────────────────┤            │
│  │ • markDoseAsTaken(id, notes?)               │            │
│  │ • markDoseAsSkipped(id, notes?)             │            │
│  │ • markDoseAsMissed(id)                      │            │
│  │ • getPastPendingDoses(userId, hours)        │            │
│  │ • getUpcomingDoses(userId, hours)           │            │
│  │ • getDosesInDateRange(userId, start, end)   │            │
│  └────────────────────┬─────────────────────────┘            │
│                       │                                      │
└───────────────────────┼──────────────────────────────────────┘
                        │
┌───────────────────────▼──────────────────────────────────────┐
│                    DATA LAYER                                │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────┐            │
│  │              SQLite Database                 │            │
│  ├──────────────────────────────────────────────┤            │
│  │  Tables:                                     │            │
│  │  • doses (id, medicine_id, status, times)   │            │
│  │  • medicines (id, name, dosage, schedule)   │            │
│  │  • schedules (id, times, frequency)         │            │
│  └──────────────────────────────────────────────┘            │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

## Data Flow: Taking a Dose

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER ACTION                                               │
│    User taps "Take" button on a dose card                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. EVENT HANDLER                                             │
│    handleTakeDose(doseId: string)                           │
│    • Validates dose ID                                      │
│    • Calls database function                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DATABASE OPERATION                                        │
│    markDoseAsTaken(id, notes?)                              │
│    • Updates dose status to 'taken'                         │
│    • Sets taken_time to current timestamp                   │
│    • Saves optional notes                                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. DATABASE UPDATE                                           │
│    UPDATE doses SET                                          │
│      status = 'taken',                                       │
│      taken_time = NOW(),                                     │
│      notes = ?                                               │
│    WHERE id = ?                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. SUCCESS RESPONSE                                          │
│    • Database confirms update                               │
│    • Returns success status                                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. UI REFRESH                                                │
│    handleRefresh()                                           │
│    • Reloads stats                                          │
│    • Reloads upcoming doses                                 │
│    • Reloads past pending doses                             │
│    • Reloads recent activity                                │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. USER FEEDBACK                                             │
│    Alert.alert("Success", "Dose marked as taken!")          │
│    • Shows success message                                  │
│    • UI updates automatically                               │
│    • Dose moves to Recent Activity                          │
└─────────────────────────────────────────────────────────────┘
```

## Component Interaction Flow

```
┌──────────────┐
│ Home Screen  │
│ (index.tsx)  │
└──────┬───────┘
       │
       │ renders
       ▼
┌──────────────────────────────────────┐
│          Timeline Component          │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  Dose Card 1                   │ │
│  │  • Medicine Name               │ │
│  │  • Dosage & Time               │ │
│  │  ┌──────────┐  ┌──────────┐   │ │
│  │  │   Take   │  │   Skip   │   │ │◄─── showActions={true}
│  │  └────┬─────┘  └────┬─────┘   │ │
│  └───────┼─────────────┼─────────┘ │
│          │             │           │
└──────────┼─────────────┼───────────┘
           │             │
           │ onTakeDose  │ onSkipDose
           │             │
           ▼             ▼
    ┌──────────────────────────┐
    │   Event Handlers         │
    │   • handleTakeDose()     │
    │   • handleSkipDose()     │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │   Database Functions     │
    │   • markDoseAsTaken()    │
    │   • markDoseAsSkipped()  │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────┐
    │   State Update           │
    │   • refreshStats()       │
    │   • refreshDoses()       │
    │   • loadPastDoses()      │
    └──────────────────────────┘
```

## History Screen Status Change Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. USER TAPS DOSE IN HISTORY                                │
│    Dose item clicked                                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. OPEN STATUS MODAL                                         │
│    handleDosePress(dose)                                     │
│    • Sets selectedDose state                                │
│    • Opens modal (setShowStatusModal(true))                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. DISPLAY MODAL                                             │
│    ┌─────────────────────────────────────────┐              │
│    │ Change Dose Status              [X]     │              │
│    ├─────────────────────────────────────────┤              │
│    │ Medicine: Aspirin                       │              │
│    │ Dosage: 500 mg                          │              │
│    │ Time: Today at 9:00 AM                  │              │
│    │ Current: Missed                         │              │
│    ├─────────────────────────────────────────┤              │
│    │ [✓ Mark as Taken]                       │◄─── User     │
│    │ [✗ Mark as Missed]                      │     selects  │
│    │ [⊖ Mark as Skipped]                     │              │
│    └─────────────────────────────────────────┘              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. HANDLE STATUS CHANGE                                      │
│    handleChangeStatus(newStatus)                             │
│    • Calls appropriate database function                    │
│    • Based on selected status                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. UPDATE DATABASE                                           │
│    markDoseAsTaken() / markDoseAsMissed() / etc.            │
│    • Updates dose record                                    │
│    • Returns success/error                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. CLOSE MODAL & REFRESH                                     │
│    • setShowStatusModal(false)                              │
│    • setSelectedDose(null)                                  │
│    • handleRefresh()                                        │
│    • Show success alert                                     │
└─────────────────────────────────────────────────────────────┘
```

## State Management Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    HOME SCREEN STATE                         │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ stats (from useMedicineStats)           │                │
│  │ • todayTaken, todayTotal, todayMissed   │                │
│  │ • currentStreak, weeklyAdherence        │                │
│  │ • activeMedicines                       │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ upcomingDoses (from useUpcomingDoses)   │                │
│  │ • Array of DoseWithMedicine             │                │
│  │ • Next 24 hours                         │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ pastDoses (useState)                    │                │
│  │ • Array of DoseWithMedicine             │                │
│  │ • Last 24 hours (pending)               │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ activity (from useRecentActivity)       │                │
│  │ • Recent taken/missed/skipped           │                │
│  │ • Last 5 activities                     │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ refreshing (useState)                   │                │
│  │ • Boolean for pull-to-refresh           │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  HISTORY SCREEN STATE                        │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ dateRangeType (useState)                │                │
│  │ • 'today' | 'week' | 'month' | 'custom' │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ startDate, endDate (useState)           │                │
│  │ • For custom date range                 │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ doses (useState)                        │                │
│  │ • Array of DoseWithMedicine             │                │
│  │ • Filtered by date range                │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ showStatusModal (useState)              │                │
│  │ • Boolean for modal visibility          │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
│  ┌─────────────────────────────────────────┐                │
│  │ selectedDose (useState)                 │                │
│  │ • DoseWithMedicine | null               │                │
│  │ • Currently selected for editing        │                │
│  └─────────────────────────────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Database Query Flow

```
┌─────────────────────────────────────────────────────────────┐
│              getPastPendingDoses(userId, 24)                 │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SELECT d.*, medicine_data                                   │
│  FROM doses d                                                │
│  JOIN medicines m ON d.medicine_id = m.id                   │
│  WHERE:                                                      │
│    • m.user_id = userId                                     │
│    • d.scheduled_time >= (now - 24 hours)                   │
│    • d.scheduled_time < now                                 │
│    • d.status IN ('scheduled', 'missed')                    │
│    • m.is_active = 1                                        │
│  ORDER BY d.scheduled_time DESC                             │
│                                                               │
│  Returns: DoseWithMedicine[]                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              getUpcomingDoses(userId, 24)                    │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  SELECT d.*, medicine_data                                   │
│  FROM doses d                                                │
│  JOIN medicines m ON d.medicine_id = m.id                   │
│  WHERE:                                                      │
│    • m.user_id = userId                                     │
│    • d.scheduled_time > now                                 │
│    • d.scheduled_time <= (now + 24 hours)                   │
│    • d.status = 'scheduled'                                 │
│    • m.is_active = 1                                        │
│  ORDER BY d.scheduled_time ASC                              │
│                                                               │
│  Returns: DoseWithMedicine[]                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│              markDoseAsTaken(id, notes?)                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  UPDATE doses                                                │
│  SET:                                                        │
│    • status = 'taken'                                       │
│    • taken_time = CURRENT_TIMESTAMP                         │
│    • notes = notes (if provided)                            │
│  WHERE id = id                                               │
│                                                               │
│  Returns: void (throws on error)                            │
└─────────────────────────────────────────────────────────────┘
```

## Error Handling Flow

```
┌─────────────────────────────────────────────────────────────┐
│ USER ACTION                                                  │
│ (Take/Skip/Change Status)                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│ TRY BLOCK                                                    │
│ • Call database function                                    │
│ • Await result                                              │
└────────────┬────────────────────────┬───────────────────────┘
             │                        │
             │ Success                │ Error
             ▼                        ▼
┌──────────────────────┐   ┌──────────────────────────────────┐
│ SUCCESS PATH         │   │ CATCH BLOCK                      │
│ • Refresh UI         │   │ • console.error(error)           │
│ • Show success alert │   │ • Alert.alert("Error", message)  │
│ • Update stats       │   │ • Keep current state             │
└──────────────────────┘   └──────────────────────────────────┘
```

## Refresh Cycle

```
┌─────────────────────────────────────────────────────────────┐
│                    REFRESH TRIGGERS                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Screen Focus (useFocusEffect)                           │
│     • User navigates to screen                              │
│     • Automatic refresh                                     │
│                                                               │
│  2. Pull-to-Refresh (ScrollView)                            │
│     • User swipes down                                      │
│     • Manual refresh                                        │
│                                                               │
│  3. After Action (handleTakeDose/handleSkipDose)            │
│     • User takes/skips dose                                 │
│     • Automatic refresh                                     │
│                                                               │
│  4. Status Change (handleChangeStatus)                      │
│     • User changes status in history                        │
│     • Automatic refresh                                     │
│                                                               │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  REFRESH SEQUENCE                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Promise.all([                                              │
│    refreshStats(),        // Update today's stats           │
│    refreshDoses(),        // Update upcoming doses          │
│    refreshActivity(),     // Update recent activity         │
│    loadPastDoses()        // Update past pending            │
│  ])                                                          │
│                                                               │
│  • All run in parallel                                      │
│  • UI updates when all complete                             │
│  • Loading indicators shown                                 │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

## Timeline Component Props Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Parent Component                          │
│                    (Home or History)                         │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ passes props
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Timeline Component                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  Props:                                                      │
│  • items: TimelineItem[]                                    │
│  • showActions?: boolean                                    │
│  • onTakeDose?: (id: string) => void                        │
│  • onSkipDose?: (id: string) => void                        │
│                                                               │
│  Logic:                                                      │
│  • canShowActions(item)                                     │
│    → returns true if scheduled/overdue AND showActions      │
│                                                               │
│  Render:                                                     │
│  • Maps items to dose cards                                 │
│  • Conditionally shows action buttons                       │
│  • Calls callbacks on button press                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Architectural Decisions

### 1. Separation of Concerns
- UI components handle presentation
- Database functions handle data
- Event handlers bridge the two

### 2. State Management
- React hooks for local state
- Custom hooks for shared logic
- Minimal prop drilling

### 3. Error Handling
- Try-catch at handler level
- User-friendly error messages
- Console logging for debugging

### 4. Performance
- Parallel data loading
- Efficient database queries
- Optimized re-renders

### 5. User Experience
- Immediate feedback
- Automatic refreshes
- Clear visual indicators
- Intuitive interactions

This architecture ensures maintainability, scalability, and excellent user experience.

