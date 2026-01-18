# Canvas API Integration - Quick Setup Guide

## ⚠️ IMPORTANT: CORS Proxy Setup

This implementation uses **https://cors-anywhere.herokuapp.com/** as a CORS proxy for the hackathon. This is a **demo-only** solution!

### To Use cors-anywhere:

1. **Request temporary access** (required for demo):
   - Go to: https://cors-anywhere.herokuapp.com/corsdemo
   - Click "Request temporary access to the demo server"
   - Access lasts for a limited time

2. **Alternative: Run your own CORS proxy locally** (recommended):
   ```bash
   # Clone cors-anywhere
   git clone https://github.com/Rob--W/cors-anywhere.git
   cd cors-anywhere
   npm install
   node server.js
   ```
   Then update [canvasService.ts](src/services/canvasService.ts:5):
   ```typescript
   const CORS_PROXY = 'http://localhost:8080/';
   ```

## How It Works

### 1. Canvas Service ([src/services/canvasService.ts](src/services/canvasService.ts))

All Canvas API requests go through the CORS proxy:
```typescript
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const CANVAS_DOMAIN = 'https://q.utoronto.ca';

// Example request
const url = `${CORS_PROXY}${CANVAS_DOMAIN}/api/v1/courses`;
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

### Quick Test

Open browser console and run:

```javascript
// Test Canvas connection
import { testCanvasConnection } from './services/canvasService';

const isValid = await testCanvasConnection('YOUR_API_KEY_HERE');
console.log('API Key Valid:', isValid);
```

### Manual Test with curl

```bash
# Test via CORS proxy
curl -H "Authorization: Bearer YOUR_API_KEY" \
  "https://cors-anywhere.herokuapp.com/https://q.utoronto.ca/api/v1/courses?enrollment_state=active"
```

## Data Structure

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
  // ... other user data
}
```

### How to Add API Key for User

You'll need a UI component (like [CanvasSetupPage](src/pages/CanvasSetupPage.tsx)) to let users input their API key:

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

## For Production (Post-Hackathon)

Replace CORS proxy with one of these:

1. **Backend Proxy Server** (your teammate was building this)
   - More secure
   - Server-side API key storage
   - Rate limiting

2. **Firebase Cloud Functions**
   - Serverless
   - Integrates with existing Firebase
   - Auto-scaling

3. **Self-hosted cors-anywhere**
   - Simple to deploy
   - Full control

## Troubleshooting

### Error: "Failed to fetch"
- Make sure you requested access at https://cors-anywhere.herokuapp.com/corsdemo
- Or run your own CORS proxy locally

### Error: "Invalid Canvas API key"
- Verify API key in Canvas settings
- Check Firestore has `canvasApiKey` field for user

### Error: "No courses found"
- Make sure user is enrolled in active courses
- Check Canvas API permissions

## Demo Video Flow

1. User signs in with Google → Firestore creates user doc
2. User navigates to Canvas Setup page
3. User pastes Canvas API token → Saves to Firestore
4. App fetches courses via CORS proxy
5. User can see courses, battle with friends, view Common Ground stats

---

**For questions, check the main [BATTLE_SYSTEM_README.md](BATTLE_SYSTEM_README.md)**
