# Support Section Feature

## Overview
Added a comprehensive Support & Help section to the profile page, providing users with easy access to help resources, feedback channels, and app information.

## Location
**Profile Tab → Support & Help Section**

The Support section is positioned after the App Settings section and before the App Info footer.

## Features

### 1. Contact Support
- **Icon**: Mail (Primary color)
- **Action**: Opens email client with pre-filled support email
- **Email**: support@medicinetracker.app
- **Description**: "Get help via email"
- **Use Case**: Users can directly email support for assistance

### 2. Help Center
- **Icon**: Book (Info color)
- **Action**: Shows alert (placeholder for future implementation)
- **Description**: "FAQs and user guides"
- **Use Case**: Access to frequently asked questions and documentation
- **Future**: Can link to online help center or in-app help pages

### 3. Report a Bug
- **Icon**: Bug (Danger color)
- **Action**: Shows alert (placeholder for future implementation)
- **Description**: "Let us know about issues"
- **Use Case**: Users can report bugs and technical issues
- **Future**: Can open bug report form or link to issue tracker

### 4. Rate the App
- **Icon**: Star (Warning/Gold color)
- **Action**: Shows alert (placeholder for future implementation)
- **Description**: "Share your feedback"
- **Use Case**: Encourage users to rate the app on app stores
- **Future**: Can link to App Store/Play Store rating page

### 5. Privacy Policy
- **Icon**: Shield with checkmark (Success color)
- **Action**: Shows alert (placeholder for future implementation)
- **Description**: "How we protect your data"
- **Use Case**: Users can review privacy policy and terms of service
- **Future**: Can open in-app browser or link to privacy policy page

## Visual Design

### Section Header
- Title: "Support & Help"
- Icon: Help circle (Primary color)
- Consistent with other sections on the profile page

### Item Layout
Each support item follows the standard settings item pattern:
```
┌─────────────────────────────────────────────┐
│ [Icon] Title                          >     │
│        Description                          │
└─────────────────────────────────────────────┘
```

### Color Coding
- **Contact Support**: Primary (Indigo) - Main support channel
- **Help Center**: Info (Blue) - Informational
- **Report a Bug**: Danger (Red) - Issues/problems
- **Rate the App**: Warning (Gold) - Positive feedback
- **Privacy Policy**: Success (Green) - Security/trust

## Implementation Details

### Code Structure
```tsx
<Card style={styles.section}>
  <View style={styles.sectionTitleContainer}>
    <Ionicons name="help-circle" size={24} color={colors.primary} />
    <Text style={[styles.sectionTitle, { color: colors.text }]}>
      Support & Help
    </Text>
  </View>

  <View style={styles.settingsGroup}>
    {/* 5 support items */}
  </View>
</Card>
```

### Interaction Handlers
- **Contact Support**: Uses `Linking.openURL('mailto:...')` with error handling
- **Other items**: Currently show alerts (placeholders for future functionality)

### Error Handling
All actions include proper error handling:
```tsx
.catch(() => Alert.alert("Error", "Unable to open email client"))
```

## User Experience

### Benefits
1. **Easy Access**: All support options in one place
2. **Clear Categories**: Different types of help clearly organized
3. **Visual Hierarchy**: Icons and colors help users quickly find what they need
4. **Consistent Design**: Matches the rest of the app's design language
5. **Accessibility**: Proper labels and touch targets

### User Flow
1. User navigates to Profile tab
2. Scrolls to Support & Help section
3. Taps on desired support option
4. Action is performed (email, alert, etc.)

## Dark Mode Support
- All icons and text adapt to dark mode
- Icon backgrounds use semi-transparent colors (15% opacity)
- Maintains readability in both light and dark themes

## Future Enhancements

### Phase 1 (Immediate)
- [ ] Link Help Center to actual documentation
- [ ] Create bug report form
- [ ] Implement app store rating links
- [ ] Add privacy policy page/link

### Phase 2 (Medium Term)
- [ ] In-app help center with searchable FAQs
- [ ] Live chat support integration
- [ ] Feedback form with screenshots
- [ ] Version history and changelog

### Phase 3 (Long Term)
- [ ] Community forum integration
- [ ] Video tutorials
- [ ] AI-powered help assistant
- [ ] Multi-language support documentation

## Testing Checklist

- [x] Section appears on profile page
- [x] All icons display correctly
- [x] Colors adapt to light/dark mode
- [x] Contact Support opens email client
- [x] Other items show appropriate alerts
- [x] Error handling works for email failures
- [x] Touch targets are adequate
- [x] Scrolling works smoothly
- [x] No linter errors
- [x] App reloads successfully

## Technical Notes

### Dependencies
- Uses existing `Linking` API from React Native
- Uses existing `Alert` API for placeholders
- No new dependencies added

### Styling
- Reuses existing styles from other sections
- `settingsGroup` and `settingItem` styles
- Consistent with app design system

### Accessibility
- All items have proper icon labels
- Chevron indicators show items are tappable
- Clear descriptions for screen readers

## File Modified
- `/app/(tabs)/profile/index.tsx` - Added Support section

## Screenshots Location
The Support section appears in the profile page between:
- **Above**: App Settings section
- **Below**: App Info footer (version number)

## Related Documentation
- `PROFILE_IMPROVEMENTS.md` - Overall profile page enhancements
- `NAVIGATION_STRUCTURE.md` - App navigation structure
- `DESIGN_SYSTEM.md` - Design system and styling

## Support Email Configuration
The support email is currently set to: `support@medicinetracker.app`

To change this, update the email address in the Contact Support handler:
```tsx
Linking.openURL("mailto:your-email@domain.com")
```

## Conclusion
The Support section provides users with essential help resources and feedback channels, improving the overall user experience and making it easier for users to get assistance when needed. The implementation is clean, extensible, and ready for future enhancements.

