// Canvas API Configuration and Service
const CANVAS_BASE_URL = 'https://q.utoronto.ca/api/v1';
const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001/api/canvas';
const USE_PROXY = true; // Set to false to use direct Canvas API (requires CORS disabled)

export interface CanvasCourse {
    id: number;
    name: string;
    course_code: string;
    enrollment_term_id: number;
    start_at: string | null;
    end_at: string | null;
    workflow_state: string;
}

export interface CanvasAssignment {
    id: number;
    name: string;
    description: string;
    due_at: string | null;
    points_possible: number;
    course_id: number;
    html_url: string;
    submission_types: string[];
    has_submitted_submissions: boolean;
    submission?: CanvasSubmission;
}

export interface CanvasSubmission {
    id: number;
    assignment_id: number;
    user_id: number;
    submitted_at: string | null;
    score: number | null;
    grade: string | null;
    workflow_state: string;
}

/**
 * Fetches all active courses for the authenticated user
 * @param apiToken - Canvas API access token
 * @returns Promise with array of courses
 */
export const fetchCanvasCourses = async (apiToken: string): Promise<CanvasCourse[]> => {
    try {
        const url = USE_PROXY
            ? `${PROXY_URL}/api/v1/courses?enrollment_state=active&per_page=100`
            : `${CANVAS_BASE_URL}/courses?enrollment_state=active&per_page=100`;

        console.log('Fetching Canvas courses from:', USE_PROXY ? 'proxy' : 'direct', url);

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Canvas courses response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Canvas API Error Response:', errorText);
            throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
        }

        const courses: CanvasCourse[] = await response.json();
        console.log(`Fetched ${courses.length} total courses from Canvas`);

        const filteredCourses = courses.filter(course =>
            course.workflow_state === 'available' &&
            (course.enrollment_term_id === 358 || course.enrollment_term_id === 357)
        );

        console.log(`Filtered to ${filteredCourses.length} available courses`);
        return filteredCourses;
    } catch (error: any) {
        console.error('Error fetching Canvas courses:', error);

        // Check if it's a CORS or network error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            console.error('🚨 Network Error: Cannot connect to', USE_PROXY ? 'proxy server' : 'Canvas API');
            if (USE_PROXY) {
                throw new Error('Cannot connect to proxy server. Make sure it is running on port 3001.');
            } else {
                throw new Error('CORS error: Unable to connect to Canvas. The browser is blocking the request.');
            }
        }

        throw error;
    }
};

/**
 * Fetches all assignments for a specific course
 * @param apiToken - Canvas API access token
 * @param courseId - Canvas course ID
 * @returns Promise with array of assignments
 */
export const fetchCourseAssignments = async (
    apiToken: string,
    courseId: number
): Promise<CanvasAssignment[]> => {
    try {
        // Try to fetch assignments with submission data included (if Canvas API supports it)
        const params = new URLSearchParams({
            per_page: '100'
        });
        // Try including submission - if it doesn't work, we'll still have assignment data
        params.append('include[]', 'submission');
        
        const url = USE_PROXY
            ? `${PROXY_URL}/api/v1/courses/${courseId}/assignments?${params.toString()}`
            : `${CANVAS_BASE_URL}/courses/${courseId}/assignments?${params.toString()}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
        }

        const assignments: CanvasAssignment[] = await response.json();
        return assignments;
    } catch (error) {
        console.error(`Error fetching assignments for course ${courseId}:`, error);
        throw error;
    }
};

/**
 * Fetches all assignments from all active courses
 * @param apiToken - Canvas API access token
 * @returns Promise with array of all assignments
 */
export const fetchAllAssignments = async (apiToken: string): Promise<CanvasAssignment[]> => {
    try {
        const courses = await fetchCanvasCourses(apiToken);
        const assignmentPromises = courses.map(course =>
            fetchCourseAssignments(apiToken, course.id)
        );

        const assignmentArrays = await Promise.all(assignmentPromises);
        return assignmentArrays.flat();
    } catch (error) {
        console.error('Error fetching all assignments:', error);
        throw error;
    }
};

/**
 * Fetches a specific assignment's submission status
 * @param apiToken - Canvas API access token
 * @param courseId - Canvas course ID
 * @param assignmentId - Canvas assignment ID
 * @returns Promise with submission data
 */
export const fetchAssignmentSubmission = async (
    apiToken: string,
    courseId: number,
    assignmentId: number
): Promise<CanvasSubmission> => {
    try {
        const url = USE_PROXY
            ? `${PROXY_URL}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/self`
            : `${CANVAS_BASE_URL}/courses/${courseId}/assignments/${assignmentId}/submissions/self`;

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error fetching submission for assignment ${assignmentId}:`, error);
        throw error;
    }
};

/**
 * Fetches upcoming assignments (due within next 30 days)
 * @param apiToken - Canvas API access token
 * @returns Promise with array of upcoming assignments
 */
export const fetchUpcomingAssignments = async (apiToken: string): Promise<CanvasAssignment[]> => {
    try {
        const allAssignments = await fetchAllAssignments(apiToken);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

        return allAssignments.filter(assignment => {
            if (!assignment.due_at) return false;
            const dueDate = new Date(assignment.due_at);
            return dueDate >= now && dueDate <= thirtyDaysFromNow;
        }).sort((a, b) => {
            const dateA = new Date(a.due_at!).getTime();
            const dateB = new Date(b.due_at!).getTime();
            return dateA - dateB;
        });
    } catch (error) {
        console.error('Error fetching upcoming assignments:', error);
        throw error;
    }
};

/**
 * Validates Canvas API token by attempting to fetch user profile
 * @param apiToken - Canvas API access token
 * @returns Promise<boolean> - true if token is valid
 */
export const validateCanvasToken = async (apiToken: string): Promise<boolean> => {
    try {
        const url = USE_PROXY
            ? `${PROXY_URL}/api/v1/users/self`
            : `${CANVAS_BASE_URL}/users/self`;

        console.log('Attempting to validate token with Canvas API via', USE_PROXY ? 'proxy' : 'direct');

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        console.log('Canvas validation response status:', response.status);

        if (!response.ok) {
            console.error(`Canvas API returned error: ${response.status} ${response.statusText}`);
        }

        return response.ok;
    } catch (error: any) {
        console.error('Error validating Canvas token:', error);
        console.error('Error type:', error.constructor.name);
        console.error('Error message:', error.message);

        // Check if it's a CORS or network error
        if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
            if (USE_PROXY) {
                console.error('🚨 Cannot connect to proxy server. Make sure it is running on port 3001');
            } else {
                console.error('🚨 CORS or Network Error: The browser blocked the request to Canvas API');
                console.error('This usually means CORS is enabled or there\'s a network issue');
            }
        }

        return false;
    }
};
