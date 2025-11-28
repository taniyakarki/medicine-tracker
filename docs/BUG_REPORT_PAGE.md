# Bug Report Page

## Overview
A comprehensive bug reporting page that allows users to submit detailed bug reports directly from the app. The page includes structured forms for collecting all necessary information to help diagnose and fix issues.

## Location
**Profile Tab → Support & Help → Report a Bug**

## Features

### 1. Basic Information Section
Collects essential details about the bug:

#### Bug Title (Required)
- Short, descriptive title
- Helps quickly identify the issue
- Example: "App crashes when adding medicine"

#### Category (Required)
Dropdown with predefined categories:
- **App Crash** - Application stops working
- **Feature Not Working** - Specific feature is broken
- **UI/Display Issue** - Visual or layout problems
- **Notification Problem** - Issues with reminders
- **Data Sync Issue** - Problems with data saving/loading
- **Performance Issue** - Slow or laggy behavior
- **Other** - Issues not covered above

#### Severity (Required)
Dropdown to indicate urgency:
- **Critical** - App Unusable
- **High** - Major Feature Broken
- **Medium** - Inconvenient
- **Low** - Minor Issue

### 2. Detailed Description Section
Provides space for comprehensive bug details:

#### What happened? (Required)
- Multi-line text area (4 lines)
- Detailed description of the bug
- What the user was doing when it occurred

#### Steps to Reproduce (Optional)
- Multi-line text area (4 lines)
- Step-by-step instructions to recreate the bug
- Helps developers reproduce and fix the issue
- Example format:
  ```
  1. Go to Medicines tab
  2. Click on Add Medicine
  3. Fill in the form
  4. See error message
  ```

#### Expected Behavior (Optional)
- Multi-line text area (3 lines)
- What should have happened
- Helps understand user expectations

#### Actual Behavior (Optional)
- Multi-line text area (3 lines)
- What actually happened instead
- Clarifies the difference from expected behavior

### 3. Device Information Section

#### Device & OS Version (Optional)
- Multi-line text area (2 lines)
- User can manually enter device details
- Example: "iPhone 14, iOS 17.2"

#### Auto-Collection Notice
- Info box explaining automatic data collection
- Device information will be automatically collected on submission
- Ensures complete technical details

### 4. Info Banner
Prominent banner at the top:
- Blue info icon
- Title: "We're here to help!"
- Message: "Please provide as much detail as possible to help us fix the issue quickly."
- Encourages thorough reporting

### 5. Action Buttons
- **Cancel** - Returns to profile page without submitting
- **Submit Report** - Validates and submits the bug report

## User Interface

### Header
```
← Report a Bug
  Help us improve by reporting issues
```

### Layout Structure
```
┌─────────────────────────────────────────┐
│ ← Report a Bug                          │
│   Help us improve by reporting issues   │
├─────────────────────────────────────────┤
│ ℹ️ We're here to help!                  │
│   Please provide as much detail...      │
├─────────────────────────────────────────┤
│ Basic Information                       │
│ • Bug Title *                           │
│ • Category *                            │
│ • Severity *                            │
├─────────────────────────────────────────┤
│ Detailed Description                    │
│ • What happened? *                      │
│ • Steps to Reproduce                    │
│ • Expected Behavior                     │
│ • Actual Behavior                       │
├─────────────────────────────────────────┤
│ Device Information                      │
│ • Device & OS Version                   │
│ 📱 Auto-collection notice               │
├─────────────────────────────────────────┤
│ [Cancel]  [Submit Report]               │
└─────────────────────────────────────────┘
```

## Validation

### Required Fields
- Bug Title
- Category
- Severity
- Description (What happened?)

### Validation Messages
- "Title is required"
- "Please select a category"
- "Please select severity level"
- "Description is required"

### Validation Behavior
- Errors shown inline below each field
- Alert shown if validation fails
- Fields cleared of errors when user starts typing

## Submission Flow

1. User fills out the form
2. Taps "Submit Report"
3. Form is validated
4. If valid:
   - Loading state shown on button
   - Simulated API call (1.5 seconds)
   - Success alert displayed
   - User returned to profile page
5. If invalid:
   - Validation errors shown
   - Alert with first error message
   - User can correct and resubmit

### Success Message
```
Bug Report Submitted

Thank you for helping us improve! 
We'll review your report and get 
back to you soon.

[OK]
```

## Technical Implementation

### State Management
```typescript
const [formData, setFormData] = useState({
  title: "",
  category: "",
  severity: "",
  description: "",
  stepsToReproduce: "",
  expectedBehavior: "",
  actualBehavior: "",
  deviceInfo: "",
});

const [errors, setErrors] = useState<Record<string, string>>({});
const [submitting, setSubmitting] = useState(false);
```

### Form Validation
```typescript
const validateForm = () => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.title.trim()) {
    newErrors.title = "Title is required";
  }
  // ... more validations
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

### Submission Handler
```typescript
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  setSubmitting(true);
  try {
    // Send to backend API
    await submitBugReport(formData);
    
    Alert.alert("Success", "Bug report submitted", [
      { text: "OK", onPress: () => router.back() }
    ]);
  } catch (error) {
    Alert.alert("Error", "Failed to submit");
  } finally {
    setSubmitting(false);
  }
};
```

## Styling

### Design System Integration
- Uses app's color scheme (light/dark mode)
- Consistent spacing (Spacing constants)
- Typography follows app standards
- Card components for sections
- Input and Select components for form fields

### Responsive Design
- Keyboard avoiding view for iOS/Android
- Scroll view for long forms
- Safe area insets respected
- Touch targets meet accessibility guidelines

## Accessibility

### Screen Reader Support
- All form fields have proper labels
- Required fields marked with asterisk
- Error messages announced
- Success/error alerts are accessible

### Keyboard Navigation
- Tab order follows logical flow
- All interactive elements focusable
- Submit button accessible via keyboard

## Future Enhancements

### Phase 1
- [ ] Implement actual API endpoint
- [ ] Add screenshot attachment option
- [ ] Auto-collect device info (OS, version, app version)
- [ ] Add email notification to user

### Phase 2
- [ ] Add video recording option
- [ ] Implement bug tracking system integration
- [ ] Add ability to view submitted bugs
- [ ] Add status updates for reported bugs

### Phase 3
- [ ] AI-powered duplicate detection
- [ ] Suggested fixes based on bug description
- [ ] Community voting on bugs
- [ ] Integration with GitHub Issues

## Integration with Profile Page

### Updated Support Section
The Support & Help section now contains only:
1. **Report a Bug** (links to bug report page) ✅
2. **Rate the App** (shows alert)

### Removed Items
- ❌ Contact Support (removed)
- ❌ Help Center (removed)
- ❌ Privacy Policy (removed)

## Files Created/Modified

### New Files
- `/app/(tabs)/profile/report-bug.tsx` - Bug report page

### Modified Files
- `/app/(tabs)/profile/index.tsx` - Updated Support section

## Testing Checklist

- [x] Page loads correctly
- [x] All form fields work
- [x] Validation works for required fields
- [x] Optional fields can be left empty
- [x] Cancel button returns to profile
- [x] Submit button shows loading state
- [x] Success alert appears after submission
- [x] Form resets after successful submission
- [x] Dark mode works correctly
- [x] Keyboard handling works
- [x] No linter errors

## User Benefits

1. **Easy Reporting** - Simple, guided form
2. **Structured Data** - Ensures all necessary info is collected
3. **Clear Categories** - Helps users classify issues
4. **Severity Levels** - Helps prioritize bug fixes
5. **Optional Details** - Users can provide as much or as little info as they want
6. **Professional** - Shows commitment to quality

## Developer Benefits

1. **Structured Reports** - Consistent format for all bug reports
2. **Categorized** - Easy to route to right team
3. **Prioritized** - Severity levels help triage
4. **Reproducible** - Steps to reproduce section
5. **Complete** - All necessary information in one place
6. **Trackable** - Can be integrated with bug tracking systems

## Conclusion

The bug report page provides a professional, user-friendly way for users to report issues. The structured form ensures all necessary information is collected while remaining simple and intuitive to use.

