# Canvas API Client for UofT Quercus

A comprehensive, production-ready Canvas API client for University of Toronto's Quercus Canvas instance.

## Features

✅ **Authentication** - Uses API tokens from environment variables or Firebase  
✅ **Pagination** - Automatically handles Canvas pagination using Link headers  
✅ **Time Conversion** - Converts UTC timestamps to America/Toronto timezone  
✅ **Error Handling** - Comprehensive error handling with specific error types  
✅ **Type Safety** - Full TypeScript support with proper types  
✅ **Proxy Support** - Works with backend proxy to avoid CORS issues  
✅ **Read-Only** - Designed for fetching data only (submissions, courses, assignments)

## Quick Start

### Installation

The Canvas API client is already set up in this project. Dependencies include:
- `date-fns` - For time manipulation
- Express proxy server (for CORS handling)

### Basic Usage

#### From Environment Variable (Node.js/Server)

```typescript
import { createCanvasClientFromEnv } from './src/services/canvasClient';

// Set CANVAS_API_TOKEN in your .env file
const client = createCanvasClientFromEnv();

// Fetch all active courses
const courses = await client.fetchCourses();

// Fetch submissions for a course
const submissions = await client.fetchCourseSubmissions(courseId);
```

#### From Firebase (React/Browser)

```typescript
import { createCanvasClientFromFirebase } from './src/services/canvasClient';

// Gets API key from Firebase user document
const client = await createCanvasClientFromFirebase();

const courses = await client.fetchCourses();
const submissions = await client.fetchCourseSubmissions(courseId);
```

#### Custom Configuration

```typescript
import { CanvasClient } from './src/services/canvasClient';

const client = new CanvasClient({
  apiToken: 'your-token-here',
  baseUrl: 'https://q.utoronto.ca',
  proxyUrl: 'http://localhost:3001',
  useProxy: true,
});
```

## API Methods

### `fetchCourses()`

Fetches all active courses for the authenticated user.

```typescript
const courses: ProcessedCourse[] = await client.fetchCourses();

// Course structure:
// {
//   id: number;
//   name: string;
//   course_code: string;
//   start_at: Date | null;  // Converted to Toronto time
//   end_at: Date | null;    // Converted to Toronto time
//   enrollment_term_id?: number;
// }
```

### `fetchCourseSubmissions(courseId: number)`

Fetches all assignments and submissions for a specific course.

Uses the `/students/submissions` endpoint which:
- Only returns submissions for the authenticated user
- Includes assignment metadata
- Handles pagination automatically

```typescript
const submissions: ProcessedAssignmentSubmission[] = 
  await client.fetchCourseSubmissions(courseId);

// Submission structure:
// {
//   assignment_id: number;
//   assignment_name: string;
//   due_at: Date | null;        // Converted to Toronto time
//   submitted_at: Date | null;  // Converted to Toronto time
//   score: number | null;
//   attempt: number;
//   late: boolean;
//   workflow_state: string;
//   excused?: boolean;
//   missing?: boolean;
// }
```

### `fetchCourse(courseId: number)`

Fetches details for a single course.

```typescript
const course: ProcessedCourse = await client.fetchCourse(courseId);
```

### `testConnection()`

Tests if the API token is valid.

```typescript
const isValid = await client.testConnection();
```

## Error Handling

The client throws specific error types:

```typescript
import {
  CanvasAuthenticationError,
  CanvasPermissionError,
  CanvasNotFoundError,
  CanvasRateLimitError,
  CanvasNetworkError,
  CanvasAPIError,
} from './src/utils/canvasErrors';

try {
  const courses = await client.fetchCourses();
} catch (error) {
  if (error instanceof CanvasAuthenticationError) {
    console.error('Invalid API token');
  } else if (error instanceof CanvasPermissionError) {
    console.error('Permission denied');
  } else if (error instanceof CanvasNetworkError) {
    console.error('Network error:', error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## Pagination

Pagination is handled automatically. The client follows Link headers to fetch all pages.

Maximum page limit: 100 (configurable in `fetchAllPages`)

## Time Handling

All Canvas timestamps are in UTC. The client automatically converts them to America/Toronto timezone.

```typescript
import { formatTorontoDate } from './src/utils/canvasTime';

const submission = await client.fetchCourseSubmissions(courseId)[0];

// submission.submitted_at is a Date object in UTC
// When formatted with Toronto timezone, shows correct local time
console.log(formatTorontoDate(submission.submitted_at));
// Output: "Dec 15, 2024, 11:30 AM EST"
```

## Examples

See `src/examples/canvasUsageExample.ts` for complete examples including:
- Fetching courses
- Fetching submissions
- Error handling
- Analytics data extraction

## Environment Variables

### Frontend (React)

```env
REACT_APP_PROXY_URL=http://localhost:3001
REACT_APP_USE_PROXY=true
```

### Backend (Node.js)

```env
CANVAS_API_TOKEN=your-token-here
PORT=3001
```

## Canvas API Endpoints Used

- `GET /api/v1/courses` - Fetch active courses
- `GET /api/v1/courses/{id}` - Fetch single course
- `GET /api/v1/courses/{id}/students/submissions` - Fetch user's submissions with assignment metadata
- `GET /api/v1/users/self` - Test connection

## Best Practices

1. **Never hard-code tokens** - Always use environment variables or secure storage
2. **Handle errors gracefully** - Use try-catch and check error types
3. **Respect rate limits** - Canvas has rate limits; pagination helps manage this
4. **Cache when appropriate** - Courses don't change often; cache if needed
5. **Use proxy for browser** - Always use the proxy server in browser environments

## Project Structure

```
src/
├── services/
│   ├── canvasClient.ts          # Main Canvas API client
│   └── canvasService.ts         # Legacy service (maintained for compatibility)
├── utils/
│   ├── canvasPagination.ts      # Pagination helper
│   ├── canvasTime.ts            # Time conversion utilities
│   └── canvasErrors.ts          # Error handling
├── types/
│   └── canvas.ts                # TypeScript type definitions
└── examples/
    └── canvasUsageExample.ts    # Usage examples
```

## Testing

Test the proxy server:

```bash
npm run test-proxy
```

Start both frontend and backend:

```bash
npm run dev
```

## Troubleshooting

### "Proxy server returned HTML instead of JSON"

The backend proxy server isn't running. Start it with:

```bash
npm run server
```

### "Invalid Canvas API token"

Check your API token:
1. In Canvas, go to Account → Settings → New Access Token
2. Copy the token
3. Add it to Firebase (`users/{uid}.canvasApiKey`) or environment variable

### "CORS error"

Make sure the proxy server is running and `REACT_APP_USE_PROXY=true` is set.

## License

For personal use only. Follow Canvas API terms of service.
