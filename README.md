# Medicine Tracker App

A comprehensive medicine tracking application built with React Native and Expo, featuring local-first architecture with future backend sync capabilities.

## Features

### Core Functionality
- **Medicine Management**: Full CRUD operations for all types of medicines (pills, liquids, injections, inhalers, drops)
- **Smart Scheduling**: Support for daily, specific days, and interval-based schedules
- **Dose Tracking**: Automatic tracking of taken, missed, and skipped doses
- **Progress Monitoring**: Real-time adherence statistics and streak tracking

### Notifications
- **Smart Reminders**: Timely notifications for medicine doses
- **Full-Screen Alerts**: High-priority notifications for critical reminders
- **Quick Actions**: Take, snooze, or skip directly from notifications
- **Background Processing**: Notifications work even when app is closed

### User Interface
- **Beautiful Design**: Clean, modern UI with dark mode support
- **Intuitive Navigation**: Tab-based navigation with smooth transitions
- **Progress Dashboard**: Visual progress indicators and upcoming dose timeline
- **History & Analytics**: Detailed adherence statistics and insights

### Future Features (Prepared)
- **Medicine Sharing**: Share schedules with family members and caregivers
- **Group Management**: Organize medicines into groups
- **Emergency Contacts**: Quick access to emergency contacts
- **Cloud Sync**: Sync data across devices (backend ready)

## Technology Stack

- **Framework**: React Native with Expo SDK 54
- **Database**: SQLite (expo-sqlite) for local-first storage
- **Navigation**: Expo Router (file-based routing)
- **Notifications**: expo-notifications with background tasks
- **State Management**: React hooks and Context API
- **Styling**: Custom design system with TypeScript

## Project Structure

```
/app                          # Expo Router screens
  /(tabs)                     # Tab-based navigation
    /medicines                # Medicine management screens
    index.tsx                 # Home dashboard
    history.tsx               # Statistics and history
    groups.tsx                # Medicine groups
    profile.tsx               # User profile and settings
  /onboarding                 # First-time user onboarding
  notification-screen.tsx     # Full-screen notification UI
  _layout.tsx                 # Root layout with initialization

/components                   # Reusable components
  /medicine                   # Medicine-specific components
  /ui                         # Generic UI components

/lib                          # Core business logic
  /database                   # SQLite database layer
    /models                   # Data models and CRUD operations
    schema.ts                 # Database schema and migrations
    operations.ts             # Generic database operations
  /notifications              # Notification system
    setup.ts                  # Notification initialization
    scheduler.ts              # Notification scheduling
    handlers.ts               # Notification response handlers
    background-tasks.ts       # Background processing
  /utils                      # Utility functions
  /hooks                      # Custom React hooks

/constants                    # Design system and constants
/types                        # TypeScript type definitions
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

1. Clone the repository
```bash
cd medicine-track
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm start
```

4. Run on your device
```bash
# iOS
npm run ios

# Android
npm run android
```

## Database Schema

The app uses SQLite with the following main tables:
- `users`: User profile information
- `medicines`: Medicine details and metadata
- `schedules`: Dosing schedules for medicines
- `doses`: Individual dose records with status
- `medicine_groups`: Groups for organizing medicines
- `emergency_contacts`: Emergency contact information
- `notification_settings`: User notification preferences

## Key Features Implementation

### Local-First Architecture
- All data stored locally in SQLite
- Instant app performance with no network dependency
- Prepared for future backend sync with sync flags and timestamps

### Notification System
- Scheduled notifications based on medicine schedules
- Background task updates missed doses every 15 minutes
- Full-screen notification UI for critical reminders
- Quick actions (Take/Snooze/Skip) from notification

### Progress Tracking
- Real-time adherence calculations
- Visual progress indicators
- Weekly and daily statistics
- Streak tracking for motivation

## Future Backend Integration

The app is designed for easy backend integration:
1. Add sync functions in `lib/database/sync.ts`
2. Implement API client in `lib/api/client.ts`
3. Add authentication flow in `app/(auth)/`
4. Enable real-time sync for shared medicines
5. Implement push notifications for shared users

## Development Notes

### Adding New Features
1. Define types in `/types`
2. Create database models in `/lib/database/models`
3. Build UI components in `/components`
4. Create screens in `/app`
5. Add custom hooks in `/lib/hooks`

### Testing
- Test medicine CRUD operations
- Verify notification scheduling
- Check background task functionality
- Test dose tracking and statistics
- Verify UI responsiveness

## License

This project is private and proprietary.

## Support

For issues or questions, please contact the development team.
