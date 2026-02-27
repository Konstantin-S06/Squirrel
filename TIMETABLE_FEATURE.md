# Timetable Feature Documentation

## Overview

The Timetable feature allows students to import their Canvas calendar (.ics file) and track class attendance directly within the Squirrel app. The system enforces that attendance can only be marked during actual lecture times.

## Features

### ✅ Implemented Features

1. **Import .ics Calendar Files**
   - Students can upload their Canvas calendar export
   - All events are parsed and stored in Firebase
   - Events persist across sessions

2. **Daily Schedule View**
   - View schedule by day of the week (Mon-Fri)
   - Shows course code, class title, time, and location
   - Current day is selected by default

3. **Real-Time Attendance Tracking**
   - Check off classes as attended
   - **Only works during actual lecture time** (enforced)
   - Attendance records saved to Firebase
   - Visual feedback for attended classes

4. **Live Class Indicator**
   - Classes happening right now show a "NOW" badge
   - Highlighted with golden border
   - Only these classes can be checked off

5. **Attendance Statistics**
   - Shows daily attendance percentage
   - Tracks attendance over time
   - Persistent across sessions

## File Structure

### Core Files

```
src/
├── components/
│   ├── Timetable.tsx              # Main timetable component
│   └── Timetable.module.css       # Timetable styles
├── services/
│   └── icsParser.ts               # ICS file parser & utilities
└── pages/
    ├── DashboardPage.tsx          # Shows timetable on dashboard
    └── CoursesPage.tsx            # Shows timetable on courses page
```

## Usage Guide

### For Students

#### 1. Get Your Canvas Calendar

1. Go to Canvas (https://q.utoronto.ca)
2. Click **Calendar** in the left sidebar
3. Click **Calendar Feed** at the bottom right
4. Copy the calendar link OR download the .ics file

#### 2. Import to Squirrel

1. Go to your Dashboard or Courses page
2. Find the **"My Timetable"** panel on the left
3. Click **"Import .ics"** button
4. Select your downloaded .ics file
5. Your schedule will appear!

#### 3. Mark Attendance

1. During class time, the class card will show a **"NOW"** badge
2. The checkbox will be enabled
3. Check the box to mark attendance
4. **Cannot check off before or after class time!**

### Visual Indicators

- 🟢 **Green border**: Regular class
- 🟡 **Gold border + "NOW" badge**: Class happening right now (can mark attendance)
- 🔘 **Grayed out**: Already attended
- ✅ **Checked**: Attendance marked

## Technical Details

### ICS Parser (`icsParser.ts`)

Parses .ics calendar files and extracts:
- Event title and course code
- Start and end times
- Location
- Day of week
- Recurrence patterns

Key Functions:
```typescript
parseICS(icsContent: string): TimetableEvent[]
getEventsForDay(events, dayOfWeek): TimetableEvent[]
isEventHappeningNow(event): boolean  // Time-based validation
formatTime(date): string
getAttendanceKey(eventId, date): string
```

### Timetable Component

**State Management:**
- `events`: Array of parsed calendar events
- `selectedDay`: Currently selected day (1=Mon, 5=Fri)
- `attendance`: Map of attendance records
- `loading`: Upload state

**Firebase Integration:**
- Events stored at: `/users/{uid}/timetable/events`
- Attendance at: `/users/{uid}/timetable/attendance`
- Real-time sync with Firestore

**Time Validation:**
```typescript
isEventHappeningNow(event) {
  const now = new Date();
  // Check if:
  // 1. Today is the correct day of week
  // 2. Current time is between start and end time
  return isDayMatch && isTimeInRange;
}
```

### Data Models

```typescript
interface TimetableEvent {
  id: string;
  title: string;
  courseCode: string;
  location: string;
  startTime: Date;
  endTime: Date;
  dayOfWeek: number; // 0-6 (Sun-Sat)
  recurrence?: string;
  description?: string;
}

interface AttendanceRecord {
  eventId: string;
  date: string; // YYYY-MM-DD
  attended: boolean;
  checkedAt?: Date;
}
```

## Security & Validation

### Time-Based Access Control

The system prevents attendance fraud by:

1. **Client-side validation**: `isEventHappeningNow()` checks current time
2. **User alerts**: Shows error if trying to check outside class time
3. **Visual feedback**: Checkbox disabled outside class time

### Future Enhancements (Optional)

For production, consider:
- Server-side time validation in Firebase Functions
- GPS location verification
- Randomized check-in codes
- Anti-cheating measures (prevent multiple accounts)

## Firebase Structure

```
users/
  {userId}/
    timetable/
      events/
        events: [
          {
            id: "event-123",
            title: "CSC110 - Lecture",
            courseCode: "CSC110",
            location: "BA1190",
            startTime: "2026-01-18T14:00:00Z",
            endTime: "2026-01-18T16:00:00Z",
            dayOfWeek: 1
          }
        ]
        uploadedAt: "2026-01-18T10:00:00Z"
      
      attendance/
        records: {
          "event-123_2026-01-18": {
            eventId: "event-123",
            date: "2026-01-18",
            attended: true,
            checkedAt: "2026-01-18T14:30:00Z"
          }
        }
        updatedAt: "2026-01-18T14:30:00Z"
```

## Styling

The timetable uses a glassmorphic design with:
- Semi-transparent background with backdrop blur
- Green and gold color scheme matching Squirrel theme
- Responsive design for mobile and desktop
- Smooth animations and transitions

Key CSS Classes:
- `.timetableContainer`: Main container
- `.eventCard`: Individual class card
- `.happening`: Currently active class (gold highlight)
- `.attended`: Already checked-off class (grayed out)

## Troubleshooting

### .ics File Not Importing

- **Issue**: File upload fails
- **Solution**: 
  - Ensure file is valid .ics format
  - Check browser console for errors
  - Try re-downloading from Canvas

### Can't Check Off Attendance

- **Issue**: Checkbox is disabled
- **Solution**:
  - Only works during actual class time
  - Check system clock is correct
  - Verify class schedule is accurate

### Events Not Showing

- **Issue**: Timetable is empty after import
- **Solution**:
  - Check that .ics file contains VEVENT entries
  - Verify events are for current semester
  - Look at browser console for parsing errors

## Example Usage in Code

### Add Timetable to Any Page

```typescript
import Timetable from '../components/Timetable';

const MyPage: React.FC = () => {
  return (
    <div>
      <h1>My Page</h1>
      <Timetable />
    </div>
  );
};
```

### Access Timetable Data Programmatically

```typescript
import { parseICS, getEventsForDay } from '../services/icsParser';

// Parse an .ics file
const events = parseICS(icsFileContent);

// Get Monday's classes
const mondayClasses = getEventsForDay(events, 1);

// Check if a class is happening now
const isNow = isEventHappeningNow(mondayClasses[0]);
```

## Integration Points

The Timetable component is currently integrated in:

1. **DashboardPage** (`/dashboard`)
   - Left panel, below Friends and Courses buttons
   - Quick access for daily attendance

2. **CoursesPage** (`/courses`)
   - Left column with course selector
   - Context-aware with course selection

## Future Enhancements

### Potential Features

1. **Gamification**
   - Earn acorns for attendance
   - Streak bonuses
   - Achievement badges

2. **Sync with Quests**
   - Auto-create quests from assignments
   - Link attendance to quest completion
   - Integrate with grading

3. **Analytics**
   - Attendance trends over semester
   - Compare with classmates
   - Predict grade impact

4. **Notifications**
   - Remind before class starts
   - Alert if missing classes
   - Weekly attendance report

5. **Social Features**
   - See which friends are in class
   - Study group coordination
   - Class notes sharing

6. **Advanced Validation**
   - QR codes for in-class verification
   - Instructor-controlled check-ins
   - Geofencing for location verification

## Summary

The Timetable feature provides a complete solution for:
- ✅ Importing Canvas schedules
- ✅ Viewing daily class schedules
- ✅ Time-restricted attendance tracking
- ✅ Persistent data storage
- ✅ Real-time updates
- ✅ User-friendly interface

All attendance marking is enforced to only work during actual class time, preventing fraudulent check-ins!
