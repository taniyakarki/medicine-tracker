# Section 1 Features - User Guide

## Quick Reference Guide for Medicine Management Features

---

## 1. 📅 Schedule Picker

### How to Use

#### Adding Time Slots
1. Tap "Add Time" button
2. Select time using the picker
3. Tap "Done" (iOS) or select time (Android)
4. Repeat to add multiple times per day

#### Selecting Days (Specific Days Frequency)
1. Set frequency to "Specific Days"
2. Tap day buttons to toggle selection
3. Selected days are highlighted in blue
4. Must select at least one day

#### Setting Intervals (Interval Frequency)
1. Set frequency to "Interval (Hours)"
2. Tap an interval button (2h, 4h, 6h, 8h, 12h, 24h)
3. Selected interval is highlighted
4. Medicine will be taken every X hours

#### Schedule Preview
- Automatically shows your schedule configuration
- Updates in real-time as you make changes
- Shows exactly when medicine will be taken

### Example Schedules

**Daily at specific times:**
```
Frequency: Daily
Times: 08:00, 14:00, 20:00
Result: Medicine taken 3 times daily
```

**Specific days:**
```
Frequency: Specific Days
Days: Mon, Wed, Fri
Times: 09:00
Result: Medicine taken Monday, Wednesday, Friday at 9 AM
```

**Interval-based:**
```
Frequency: Interval
Interval: 8 hours
Start time: 08:00
Result: Medicine taken every 8 hours starting at 8 AM
```

---

## 2. 📊 Dose History List

### Features

#### Filtering
- **All**: Shows all doses regardless of status
- **Taken**: Shows only doses you've taken
- **Missed**: Shows doses you missed
- **Skipped**: Shows doses you intentionally skipped

Each filter shows a count badge.

#### Information Displayed
- Medicine name (if viewing multiple medicines)
- Dosage amount
- Status with color-coded icon:
  - 🟢 Green checkmark = Taken
  - 🔴 Red X = Missed
  - 🟡 Yellow minus = Skipped
  - 🔵 Blue clock = Scheduled
- Scheduled date and time
- Actual taken time (if taken)
- Any notes you added

#### Date Formatting
- Shows "Today" for today's doses
- Shows "Yesterday" for yesterday's doses
- Shows formatted date for older doses

### Where to Find
- Medicine detail screen → Tap "Show" in Dose History section
- History tab (for all medicines)

---

## 3. 📷 Medicine Image Upload

### How to Add an Image

#### From Camera
1. Tap the image upload area
2. Select "Take Photo"
3. Allow camera permission if prompted
4. Take a photo of your medicine
5. Crop to square (1:1 ratio)
6. Confirm

#### From Gallery
1. Tap the image upload area
2. Select "Choose from Gallery"
3. Allow media library permission if prompted
4. Select a photo
5. Crop to square (1:1 ratio)
6. Confirm

### Managing Images
- **Edit**: Tap the camera icon on existing image
- **Remove**: Tap the trash icon on existing image
- **Replace**: Edit and select new image

### Tips
- Take photos in good lighting
- Include the medicine bottle/packaging
- Make sure text is readable
- Square photos work best

### Where Images Appear
- Medicine cards (circular thumbnail)
- Medicine detail view (full width at top)
- Add/Edit forms (preview)

---

## 4. 🎨 Medicine Color Coding

### Available Colors
18 beautiful colors to choose from:
- Red, Orange, Amber, Yellow
- Lime, Green, Emerald, Teal
- Cyan, Sky, Blue, Indigo
- Violet, Purple, Fuchsia, Pink
- Rose, Gray

### How to Select a Color
1. Scroll through the color grid
2. Tap a color to select it
3. Selected color shows a checkmark
4. Preview appears below the grid
5. Tap "Clear" to remove selection

### Where Colors Appear
- **Medicine Cards**: 
  - Colored left border
  - Colored circle with white icon
- **Medicine Detail View**:
  - Large colored circle at top
  - White icon inside

### Color Priority
1. If medicine has an image → shows image
2. If medicine has a color → shows colored circle
3. Otherwise → shows default icon

### Use Cases
- Color-code by type (red = urgent, blue = daily)
- Match medicine bottle color
- Group related medicines
- Personal preference

---

## 5. 📝 Enhanced Add Medicine Form

### New Features
1. **Multiple Time Slots**: Add as many times as needed
2. **Day Selection**: Visual day picker for specific days
3. **Interval Selection**: Easy interval selection
4. **Image Upload**: Add medicine photo
5. **Color Selection**: Choose identifying color
6. **Schedule Preview**: See your schedule before saving

### Form Sections
1. **Basic Info**: Name, type, dosage, unit
2. **Frequency**: Daily, specific days, or interval
3. **Schedule**: Time slots and day/interval selection
4. **Visual**: Image and color
5. **Details**: Dates and notes

### Validation
- All required fields must be filled
- At least one time slot required
- Specific days: at least one day required
- Interval: interval hours required
- Clear error messages shown

---

## 6. ✏️ Enhanced Edit Medicine Form

### What You Can Edit
- All basic information
- Complete schedule (times, days, intervals)
- Medicine image (add, change, remove)
- Medicine color (change or remove)
- Start and end dates
- Notes

### Schedule Editing
- Loads existing schedules
- Can add/remove time slots
- Can change days of week
- Can change interval
- Old schedules deleted, new ones created

### Important Notes
- Changes save to database immediately
- Dose history is preserved
- Future doses will use new schedule
- Past doses remain unchanged

---

## 7. 🔍 Enhanced Medicine Detail View

### New Sections

#### Medicine Image
- Full-width image at top (if available)
- Tap to view larger (future feature)

#### Color & Icon
- Large colored circle with icon
- Or regular icon if no color

#### Schedule Information
- Lists all time slots
- Shows days of week (if applicable)
- Shows interval (if applicable)
- Clock icons for visual clarity

#### Dose History
- Toggle show/hide
- Full filtering capabilities
- Last 50 doses shown
- Load more option (future)

### Quick Actions
- Edit Medicine button
- Delete Medicine button (with confirmation)

---

## 8. 🎴 Enhanced Medicine Cards

### Visual Elements
- **Image**: Circular thumbnail (if available)
- **Color**: Colored border + colored icon circle
- **Default**: Standard icon

### Information Shown
- Medicine name
- Dosage and unit
- Next dose time (if scheduled)

### Interaction
- Tap card to view details
- Visual feedback on tap
- Smooth animations

---

## Tips & Best Practices

### Scheduling
- Use "Daily" for medicines taken at same times every day
- Use "Specific Days" for medicines taken only certain days
- Use "Interval" for medicines taken every X hours
- Add multiple time slots for medicines taken multiple times per day

### Images
- Take clear, well-lit photos
- Include medicine name on bottle
- Update image if medicine changes
- Optional but helpful for identification

### Colors
- Use consistent colors for medicine types
- Red for urgent/important
- Blue for daily routine
- Green for supplements
- Personal preference is fine

### Organization
- Add notes for special instructions
- Set end dates for temporary medicines
- Use descriptive names
- Keep dosage information accurate

---

## Troubleshooting

### Camera Not Working
- Check app permissions in device settings
- Allow camera access
- Restart app if needed

### Gallery Not Working
- Check media library permissions
- Allow photo access
- Restart app if needed

### Schedule Not Saving
- Ensure at least one time slot added
- Check validation messages
- Verify days selected (specific days)
- Verify interval selected (interval mode)

### Image Not Displaying
- Check image file exists
- Try taking new photo
- Check storage permissions
- Contact support if persists

---

## Keyboard Shortcuts & Gestures

### Time Picker
- **iOS**: Swipe to change time, tap "Done" to confirm
- **Android**: Tap to select, automatic confirmation

### Day Selection
- Tap to toggle day on/off
- Multiple days can be selected
- Visual feedback immediate

### Color Selection
- Tap to select
- Tap same color to deselect
- Checkmark shows selection

### Image Management
- Tap empty area to add
- Tap camera icon to change
- Tap trash icon to remove

---

## Accessibility

### Screen Reader Support
- All buttons have labels
- Color names announced
- Status information read aloud
- Navigation clear and logical

### Visual Accessibility
- High contrast colors
- Large touch targets
- Clear icons and labels
- Dark mode supported

### Keyboard Navigation
- Tab through form fields
- Enter to submit
- Escape to cancel
- Standard shortcuts work

---

## What's Next?

### Future Enhancements (Not Yet Implemented)
- Image filters and effects
- Cloud backup for images
- Custom color picker (hex input)
- Schedule templates
- Bulk operations
- Import/export schedules

### Already Complete ✅
- Multiple time slots per medicine
- Day of week selection
- Interval-based scheduling
- Image upload and management
- Color coding system
- Dose history with filtering
- Complete form validation
- Dark mode support
- Cross-platform compatibility

---

**Need Help?**
All features are intuitive and include helpful hints. Look for:
- Helper text below inputs
- Empty state messages
- Validation error messages
- Preview sections

**Enjoy your enhanced medicine tracking experience!** 💊✨

