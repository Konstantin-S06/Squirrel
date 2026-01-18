# Canvas API Integration - UofT Canvas

## ✅ Good News: No CORS Proxy Needed!

UofT Canvas (`q.utoronto.ca`) has CORS enabled, so you can call the API directly from the browser without any proxy!

## How It Works

### 1. Canvas Service ([src/services/canvasService.ts](src/services/canvasService.ts))

Direct API calls to Canvas:
```typescript
const CANVAS_DOMAIN = 'https://q.utoronto.ca';

// Example request
const url = `${CANVAS_DOMAIN}/api/v1/courses`;
```

### 2. Available Functions

**Basic Data:**
- `fetchCanvasCourses()` - Get all active courses
- `fetchCourseAssignments(courseId)` - Get assignments for a course
- `fetchCourseSubmissions(courseId)` - Get submissions for current user
- `fetchCanvasProfile()` - Get current user profile
- `testCanvasConnection(apiKey)` - Validate API key

**Advanced:**
- `fetchAllCourseData()` - Get everything (courses + assignments + submissions + stats)
- `calculateMilestoneStats(assignments, submissions)` - Calculate completion percentages

**Auth:**
- `isCanvasConnected()` - Check if user has Canvas API key in Firestore
- API keys stored in Firestore: `users/{uid}/canvasApiKey`

## Usage Example

### Fetch Courses

```typescript
import { fetchCanvasCourses } from '../services/canvasService';

const MyCourses = () => {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCanvasCourses();
        setCourses(data);
      } catch (error) {
        console.error('Failed to load courses:', error);
      }
    };

    loadCourses();
  }, []);

  return (
    <div>
      {courses.map(course => (
        <div key={course.id}>{course.name}</div>
      ))}
    </div>
  );
};
```

### Get Milestone Stats (for Battle Common Ground)

```typescript
import {
  fetchCourseAssignments,
  fetchCourseSubmissions,
  calculateMilestoneStats
} from '../services/canvasService';

const stats = async (courseId) => {
  const [assignments, submissions] = await Promise.all([
    fetchCourseAssignments(courseId),
    fetchCourseSubmissions(courseId)
  ]);

  const milestoneStats = calculateMilestoneStats(assignments, submissions);

  console.log(`Early completion rate: ${milestoneStats.earlyCompletionRate}%`);
  // Output: "Early completion rate: 85%"
};
```

## Testing

### Quick Test in Browser Console

```javascript
// Test Canvas connection
const testAPI = async (apiKey) => {
  const response = await fetch('https://q.utoronto.ca/api/v1/users/self', {
    headers: { 'Authorization': `Bearer ${apiKey}` }
  });
  const data = await response.json();
  console.log('✅ Works!', data);
};

testAPI('YOUR_API_KEY_HERE');
```

### Get Your Canvas API Key

1. Go to: https://q.utoronto.ca/profile/settings
2. Scroll to "Approved Integrations"
3. Click "+ New Access Token"
4. Purpose: "Squirrel Hackathon"
5. Generate and copy token

## Data Structures

### CanvasCourse
```typescript
{
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id?: number;
  start_at?: string;
  end_at?: string;
}
```

### CanvasAssignment
```typescript
{
  id: number;
  name: string;
  description?: string;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
}
```

### MilestoneStats
```typescript
{
  total: number;              // Total assignments
  completed: number;          // Submitted & graded
  completedEarly: number;     // Submitted on time
  completedLate: number;      // Submitted late
  pending: number;            // Not yet submitted
  earlyCompletionRate: number; // Percentage (0-100)
}
```

## Storing Canvas API Keys

Users' Canvas API keys are stored in Firestore:

```typescript
// Firestore structure
users/{uid}: {
  name: string,
  canvasApiKey: string,  // ← User's Canvas API token
  level: number,
  xp: number,
  acorns: number,
  // ... other user data
}
```

### How to Save API Key

```typescript
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const saveCanvasApiKey = async (apiKey: string) => {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');

  await updateDoc(doc(db, 'users', user.uid), {
    canvasApiKey: apiKey
  });
};
```

## Common API Endpoints

```javascript
// User profile
GET /api/v1/users/self

// Active courses
GET /api/v1/courses?enrollment_state=active

// Course assignments
GET /api/v1/courses/{courseId}/assignments

// User submissions for a course
GET /api/v1/courses/{courseId}/students/submissions?student_ids[]={userId}
```

## Troubleshooting

### Error: "Invalid Canvas API key"
- Verify API key in Canvas settings
- Check Firestore has `canvasApiKey` field for user
- Make sure token hasn't expired

### Error: "No courses found"
- Make sure user is enrolled in active courses
- Check enrollment_state parameter

### Error: "Canvas API key not found"
- User needs to save their Canvas API token first
- Navigate them to Canvas Setup page

## Demo Flow

1. User signs in with Google → Firestore creates user doc
2. User navigates to Canvas Setup page
3. User pastes Canvas API token → Saves to Firestore
4. App fetches courses directly from Canvas
5. User can see courses, battle with friends, view Common Ground stats

---

**For battle system details, check [BATTLE_SYSTEM_README.md](BATTLE_SYSTEM_README.md)**
