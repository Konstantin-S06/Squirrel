/**
 * Canvas API Client Usage Examples
 * 
 * Examples demonstrating how to use the Canvas API client
 * for fetching courses and assignment submissions
 */

import { CanvasClient, createCanvasClientFromFirebase, createCanvasClientFromEnv } from '../services/canvasClient';
import {
  CanvasAPIError,
  CanvasAuthenticationError,
  CanvasPermissionError,
} from '../utils/canvasErrors';

/**
 * Example 1: Using the client from environment variable
 * (For Node.js scripts or server-side code)
 */
export async function exampleFromEnv() {
  try {
    // Create client from environment variable
    const client = createCanvasClientFromEnv();

    // Test connection
    const isConnected = await client.testConnection();
    if (!isConnected) {
      console.error('Failed to connect to Canvas API');
      return;
    }

    // Fetch all active courses
    console.log('Fetching courses...');
    const courses = await client.fetchCourses();
    console.log(`Found ${courses.length} active courses`);

    // Display courses
    courses.forEach((course) => {
      console.log(`\nCourse: ${course.course_code} - ${course.name}`);
      console.log(`  ID: ${course.id}`);
      if (course.start_at) {
        console.log(`  Start: ${course.start_at.toLocaleString('en-US', { timeZone: 'America/Toronto' })}`);
      }
      if (course.end_at) {
        console.log(`  End: ${course.end_at.toLocaleString('en-US', { timeZone: 'America/Toronto' })}`);
      }
    });

    // Fetch submissions for first course
    if (courses.length > 0) {
      const firstCourse = courses[0];
      console.log(`\n\nFetching submissions for ${firstCourse.course_code}...`);
      
      const submissions = await client.fetchCourseSubmissions(firstCourse.id);
      console.log(`Found ${submissions.length} assignments/submissions`);

      // Display submissions
      submissions.forEach((submission) => {
        console.log(`\nAssignment: ${submission.assignment_name}`);
        console.log(`  Assignment ID: ${submission.assignment_id}`);
        if (submission.due_at) {
          console.log(`  Due: ${submission.due_at.toLocaleString('en-US', { timeZone: 'America/Toronto' })}`);
        }
        if (submission.submitted_at) {
          console.log(`  Submitted: ${submission.submitted_at.toLocaleString('en-US', { timeZone: 'America/Toronto' })}`);
          console.log(`  Late: ${submission.late ? 'Yes' : 'No'}`);
        } else {
          console.log(`  Status: Not submitted`);
        }
        if (submission.score !== null) {
          console.log(`  Score: ${submission.score}`);
        }
        console.log(`  Attempt: ${submission.attempt}`);
        console.log(`  State: ${submission.workflow_state}`);
      });
    }

  } catch (error) {
    handleCanvasError(error);
  }
}

/**
 * Example 2: Using the client from Firebase
 * (For React components in the browser)
 */
export async function exampleFromFirebase() {
  try {
    // Create client from Firebase (gets API key from user's Firebase document)
    const client = await createCanvasClientFromFirebase();

    // Fetch courses
    const courses = await client.fetchCourses();
    console.log('Active courses:', courses);

    // Fetch submissions for each course
    for (const course of courses) {
      const submissions = await client.fetchCourseSubmissions(course.id);
      console.log(`\n${course.course_code} - ${submissions.length} assignments`);
      
      // Analyze submissions
      const submitted = submissions.filter(s => s.submitted_at !== null);
      const late = submissions.filter(s => s.late);
      const graded = submissions.filter(s => s.score !== null);

      console.log(`  Submitted: ${submitted.length}/${submissions.length}`);
      console.log(`  Late: ${late.length}`);
      console.log(`  Graded: ${graded.length}`);
    }

  } catch (error) {
    handleCanvasError(error);
  }
}

/**
 * Example 3: Creating client with custom configuration
 */
export function exampleCustomConfig() {
  const apiToken = 'your-api-token-here';
  
  const client = new CanvasClient({
    apiToken,
    baseUrl: 'https://q.utoronto.ca',
    proxyUrl: 'http://localhost:3001',
    useProxy: true,
  });

  // Use client...
  return client;
}

/**
 * Example 4: Error handling
 */
function handleCanvasError(error: unknown) {
  if (error instanceof CanvasAuthenticationError) {
    console.error('Authentication failed:', error.message);
    console.error('Please check your Canvas API token');
  } else if (error instanceof CanvasPermissionError) {
    console.error('Permission denied:', error.message);
    console.error('You may not have access to this resource');
  } else if (error instanceof CanvasAPIError) {
    console.error('Canvas API error:', error.message);
    if (error.statusCode) {
      console.error(`Status code: ${error.statusCode}`);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}

/**
 * Example 5: Fetching data for analytics
 */
export async function fetchAnalyticsData(client: CanvasClient) {
  const courses = await client.fetchCourses();
  
  const analytics = {
    totalCourses: courses.length,
    totalAssignments: 0,
    totalSubmissions: 0,
    lateSubmissions: 0,
    averageScore: 0,
    courses: [] as any[],
  };

  for (const course of courses) {
    const submissions = await client.fetchCourseSubmissions(course.id);
    
    const submitted = submissions.filter(s => s.submitted_at !== null);
    const late = submissions.filter(s => s.late);
    const graded = submissions.filter(s => s.score !== null);
    const scores = graded.map(s => s.score!).filter(s => s !== null);
    const avgScore = scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : null;

    analytics.totalAssignments += submissions.length;
    analytics.totalSubmissions += submitted.length;
    analytics.lateSubmissions += late.length;

    analytics.courses.push({
      course_code: course.course_code,
      course_name: course.name,
      assignments: submissions.length,
      submitted: submitted.length,
      late: late.length,
      graded: graded.length,
      averageScore: avgScore,
    });
  }

  // Calculate overall average
  const allScores: number[] = [];
  analytics.courses.forEach(course => {
    if (course.averageScore !== null) {
      allScores.push(course.averageScore);
    }
  });
  analytics.averageScore = allScores.length > 0
    ? allScores.reduce((a, b) => a + b, 0) / allScores.length
    : 0;

  return analytics;
}
