# Canvas LMS Integration Documentation

This document explains how to use the Canvas API integration in the Squirrel app.

## Overview

The Canvas integration allows the app to fetch courses and assignments from the University of Toronto's Canvas LMS. The implementation is split into several files:

- `src/services/canvasConfig.ts` - Core Canvas API functions
- `src/hooks/useCanvasData.ts` - React hook for easy Canvas data access
- `src/pages/CanvasSetupPage.tsx` - UI for connecting Canvas account
- `src/components/CanvasSetupButton.tsx` - Button to navigate to setup

## Setup

### 1. User Setup

Users need to connect their Canvas account by:

1. Clicking "Connect Canvas" button
2. Entering their Canvas API access token
3. The app validates the token and fetches their courses
4. Token is securely stored in Firebase Firestore

### 2. Getting a Canvas API Token

Users can get their Canvas API token from:
1. Go to https://q.utoronto.ca
2. Click on "Account" → "Settings"
3. Scroll down to "Approved Integrations"
4. Click "+ New Access Token"
5. Enter a purpose (e.g., "Squirrel App") and click "Generate Token"
6. Copy the token (it will only be shown once)

## API Functions

### Core Functions in `canvasConfig.ts`

#### `fetchCanvasCourses(apiToken: string): Promise<CanvasCourse[]>`
Fetches all active courses for the authenticated user.

```typescript
const courses = await fetchCanvasCourses(apiToken);
console.log(courses); // Array of course objects
```

#### `fetchCourseAssignments(apiToken: string, courseId: number): Promise<CanvasAssignment[]>`
Fetches all assignments for a specific course.

```typescript
const assignments = await fetchCourseAssignments(apiToken, 123456);
```

#### `fetchAllAssignments(apiToken: string): Promise<CanvasAssignment[]>`
Fetches all assignments from all active courses.

```typescript
const allAssignments = await fetchAllAssignments(apiToken);
```

#### `fetchUpcomingAssignments(apiToken: string): Promise<CanvasAssignment[]>`
Fetches assignments due within the next 30 days, sorted by due date.

```typescript
const upcoming = await fetchUpcomingAssignments(apiToken);
```

#### `fetchAssignmentSubmission(apiToken: string, courseId: number, assignmentId: number): Promise<CanvasSubmission>`
Fetches the current user's submission status for a specific assignment.

```typescript
const submission = await fetchAssignmentSubmission(apiToken, 123456, 789012);
```

#### `validateCanvasToken(apiToken: string): Promise<boolean>`
Validates if a Canvas API token is valid.

```typescript
const isValid = await validateCanvasToken(apiToken);
if (isValid) {
  console.log('Token is valid!');
}
```

## Using the Canvas Hook

The `useCanvasData` hook provides an easy way to access Canvas data in React components:

```typescript
import { useCanvasData } from '../hooks/useCanvasData';

const MyComponent: React.FC = () => {
  const { 
    isConnected, 
    loading, 
    error, 
    getCourses, 
    getAssignments,
    getUpcomingAssignments 
  } = useCanvasData();

  useEffect(() => {
    const loadData = async () => {
      if (isConnected) {
        const courses = await getCourses();
        console.log(courses);
      }
    };
    loadData();
  }, [isConnected]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!isConnected) return <div>Please connect Canvas</div>;

  return <div>Canvas connected!</div>;
};
```

## Data Types

### CanvasCourse
```typescript
interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id: number;
  start_at: string | null;
  end_at: string | null;
  workflow_state: string;
}
```

### CanvasAssignment
```typescript
interface CanvasAssignment {
  id: number;
  name: string;
  description: string;
  due_at: string | null;
  points_possible: number;
  course_id: number;
  html_url: string;
  submission_types: string[];
  has_submitted_submissions: boolean;
}
```

### CanvasSubmission
```typescript
interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string | null;
  score: number | null;
  grade: string | null;
  workflow_state: string;
}
```

## Example: Displaying Courses

The `CoursesPage.tsx` demonstrates how to fetch and display Canvas courses:

```typescript
import { useCanvasData } from '../hooks/useCanvasData';
import { CanvasCourse } from '../services/canvasConfig';

const CoursesPage: React.FC = () => {
  const [canvasCourses, setCanvasCourses] = useState<CanvasCourse[]>([]);
  const { getCourses, isConnected } = useCanvasData();

  useEffect(() => {
    const loadCourses = async () => {
      if (isConnected) {
        const courses = await getCourses();
        setCanvasCourses(courses);
      }
    };
    loadCourses();
  }, [isConnected]);

  return (
    <div>
      {canvasCourses.map(course => (
        <div key={course.id}>
          {course.course_code} - {course.name}
        </div>
      ))}
    </div>
  );
};
```

## Example: Displaying Upcoming Assignments

```typescript
import { useCanvasData } from '../hooks/useCanvasData';
import { CanvasAssignment } from '../services/canvasConfig';

const UpcomingAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<CanvasAssignment[]>([]);
  const { getUpcomingAssignments, isConnected } = useCanvasData();

  useEffect(() => {
    const loadAssignments = async () => {
      if (isConnected) {
        const upcoming = await getUpcomingAssignments();
        setAssignments(upcoming);
      }
    };
    loadAssignments();
  }, [isConnected]);

  return (
    <div>
      <h2>Upcoming Assignments</h2>
      {assignments.map(assignment => (
        <div key={assignment.id}>
          <h3>{assignment.name}</h3>
          <p>Due: {new Date(assignment.due_at!).toLocaleDateString()}</p>
          <p>Points: {assignment.points_possible}</p>
          <a href={assignment.html_url} target="_blank" rel="noopener noreferrer">
            View in Canvas
          </a>
        </div>
      ))}
    </div>
  );
};
```

## Security Considerations

1. **API Token Storage**: Canvas API tokens are stored in Firestore with proper security rules
2. **Client-side API Calls**: Currently, API calls are made from the client. Consider moving to Firebase Functions for production to:
   - Hide API tokens from client
   - Add rate limiting
   - Implement caching
   - Better error handling

## Rate Limiting

Canvas API has rate limits:
- 3000 requests per hour per token
- Consider implementing caching to reduce API calls
- Use batch operations when possible

## Error Handling

All Canvas API functions throw errors that should be caught:

```typescript
try {
  const courses = await getCourses();
} catch (error) {
  console.error('Failed to fetch courses:', error);
  // Show user-friendly error message
}
```

## Future Enhancements

1. **Caching**: Implement local caching to reduce API calls
2. **Firebase Functions**: Move API calls to backend for better security
3. **Webhooks**: Use Canvas webhooks for real-time updates
4. **Assignment Sync**: Automatically sync assignments to quests
5. **Grade Tracking**: Track assignment grades and calculate progress
6. **Notifications**: Alert users of upcoming deadlines

## Troubleshooting

### "Invalid Canvas API token"
- Ensure token is correctly copied from Canvas
- Check if token has expired
- Verify user has access to Canvas courses

### "Failed to fetch courses"
- Check internet connection
- Verify Canvas is accessible (https://q.utoronto.ca)
- Check browser console for CORS errors
- Ensure API token has proper permissions

### No courses showing
- Verify user is enrolled in active courses
- Check if courses are published in Canvas
- Ensure enrollment state is "active"

## Canvas API Documentation

For more information about the Canvas API:
- [Canvas LMS REST API Documentation](https://canvas.instructure.com/doc/api/)
- [UofT Canvas](https://q.utoronto.ca)
