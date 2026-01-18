import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

// CORS Proxy for hackathon (quick & dirty solution)
const CORS_PROXY = 'https://cors-anywhere.herokuapp.com/';
const CANVAS_DOMAIN = 'https://q.utoronto.ca';

export interface CanvasCourse {
  id: number;
  name: string;
  course_code: string;
  enrollment_term_id?: number;
  start_at?: string;
  end_at?: string;
  workflow_state?: string;
}

export interface CanvasAssignment {
  id: number;
  name: string;
  description?: string;
  due_at: string | null;
  points_possible: number | null;
  course_id: number;
  submission_types?: string[];
  assignment_group_id?: number;
}

/**
 * Retrieves the Canvas API key from Firebase for the current user
 */
async function getCanvasApiKey(): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.canvasApiKey || null;
    }
    return null;
  } catch (error) {
    console.error('Error retrieving Canvas API key:', error);
    throw error;
  }
}

/**
 * Makes an authenticated request to Canvas API using CORS proxy
 */
async function canvasRequest(endpoint: string): Promise<any> {
  const apiKey = await getCanvasApiKey();
  if (!apiKey) {
    throw new Error('Canvas API key not found. Please connect your Canvas account.');
  }

  try {
    const url = `${CORS_PROXY}${CANVAS_DOMAIN}${endpoint}`;
    console.log('Making Canvas API request to:', url.replace(apiKey, '***'));

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Canvas API key. Please check your API token.');
      }
      throw new Error(`Canvas API error (${response.status}): ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    console.error('Canvas API request failed:', error);
    throw error;
  }
}

/**
 * Checks if user has Canvas connected
 */
export async function isCanvasConnected(): Promise<boolean> {
  try {
    const apiKey = await getCanvasApiKey();
    return !!apiKey;
  } catch (error) {
    return false;
  }
}

/**
 * Tests the Canvas API connection with a simple request
 */
export async function testCanvasConnection(apiKey: string): Promise<boolean> {
  try {
    const url = `${CORS_PROXY}${CANVAS_DOMAIN}/api/v1/users/self`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    return response.ok;
  } catch (error) {
    console.error('Canvas connection test error:', error);
    return false;
  }
}

/**
 * Fetches all active courses for the current user from Canvas
 * Uses CORS proxy to avoid CORS issues
 */
export async function fetchCanvasCourses(): Promise<CanvasCourse[]> {
  try {
    const courses = await canvasRequest('/api/v1/courses?enrollment_state=active&per_page=100');

    console.log('✅ Canvas API call successful!');
    console.log(`Received ${courses.length} courses:`, courses);

    // Filter out courses without names (deleted/invalid courses)
    const validCourses = courses.filter((course: CanvasCourse) => course.name && course.course_code);
    console.log(`Filtered to ${validCourses.length} valid courses`);

    return validCourses;
  } catch (error: any) {
    console.error('❌ Error fetching Canvas courses:', error);
    throw error;
  }
}

/**
 * Fetches assignments for a specific course
 */
export async function fetchCourseAssignments(courseId: number): Promise<CanvasAssignment[]> {
  try {
    const assignments = await canvasRequest(
      `/api/v1/courses/${courseId}/assignments?per_page=100`
    );
    return assignments;
  } catch (error) {
    console.error(`Error fetching assignments for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Fetches course details
 */
export async function fetchCourseDetails(courseId: number): Promise<CanvasCourse> {
  try {
    const course = await canvasRequest(`/api/v1/courses/${courseId}`);
    return course;
  } catch (error) {
    console.error(`Error fetching course details for ${courseId}:`, error);
    throw error;
  }
}

/**
 * Canvas Submission Interface
 */
export interface CanvasSubmission {
  id: number;
  assignment_id: number;
  user_id: number;
  submitted_at: string | null;
  score: number | null;
  grade: string | null;
  late: boolean;
  workflow_state: string;
}

/**
 * Milestone Stats Interface
 */
export interface MilestoneStats {
  total: number;
  completed: number;
  completedEarly: number;
  completedLate: number;
  pending: number;
  earlyCompletionRate: number; // Percentage
}

/**
 * Fetches submissions for a specific course (for current user)
 */
export async function fetchCourseSubmissions(courseId: number): Promise<CanvasSubmission[]> {
  try {
    // Get current user first
    const user = await canvasRequest('/api/v1/users/self');

    // Fetch submissions for this user
    const submissions = await canvasRequest(
      `/api/v1/courses/${courseId}/students/submissions?student_ids[]=${user.id}&per_page=100`
    );
    return submissions;
  } catch (error) {
    console.error(`Error fetching submissions for course ${courseId}:`, error);
    throw error;
  }
}

/**
 * Calculate milestone completion statistics
 * Used for battle "Common Ground" feature
 */
export function calculateMilestoneStats(
  assignments: CanvasAssignment[],
  submissions: CanvasSubmission[]
): MilestoneStats {
  const submissionMap = new Map(
    submissions.map((sub) => [sub.assignment_id, sub])
  );

  let completed = 0;
  let completedEarly = 0;
  let completedLate = 0;
  let pending = 0;

  assignments.forEach((assignment) => {
    const submission = submissionMap.get(assignment.id);

    if (submission && submission.workflow_state === 'graded') {
      completed++;
      if (submission.late) {
        completedLate++;
      } else {
        completedEarly++;
      }
    } else {
      pending++;
    }
  });

  const earlyCompletionRate =
    completed > 0 ? Math.round((completedEarly / completed) * 100) : 0;

  return {
    total: assignments.length,
    completed,
    completedEarly,
    completedLate,
    pending,
    earlyCompletionRate,
  };
}

/**
 * Fetch user's profile from Canvas
 */
export async function fetchCanvasProfile(): Promise<any> {
  try {
    const profile = await canvasRequest('/api/v1/users/self');
    return profile;
  } catch (error) {
    console.error('Error fetching Canvas profile:', error);
    throw error;
  }
}

/**
 * Get all course data including assignments and submissions
 * Useful for comprehensive stats and Common Ground feature
 */
export async function fetchAllCourseData() {
  try {
    const courses = await fetchCanvasCourses();

    const courseDataPromises = courses.map(async (course) => {
      try {
        const [assignments, submissions] = await Promise.all([
          fetchCourseAssignments(course.id),
          fetchCourseSubmissions(course.id),
        ]);

        const stats = calculateMilestoneStats(assignments, submissions);

        return {
          course,
          assignments,
          submissions,
          stats,
        };
      } catch (error) {
        console.error(`Error fetching data for course ${course.id}:`, error);
        return {
          course,
          assignments: [],
          submissions: [],
          stats: {
            total: 0,
            completed: 0,
            completedEarly: 0,
            completedLate: 0,
            pending: 0,
            earlyCompletionRate: 0,
          },
        };
      }
    });

    return await Promise.all(courseDataPromises);
  } catch (error) {
    console.error('Error fetching all course data:', error);
    throw error;
  }
}
