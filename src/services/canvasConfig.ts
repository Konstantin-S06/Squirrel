// Canvas API Configuration and Service
const CANVAS_BASE_URL = 'https://q.utoronto.ca/api/v1';

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
        const response = await fetch(`${CANVAS_BASE_URL}/courses?enrollment_state=active&per_page=100`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
        }

        const courses: CanvasCourse[] = await response.json();
        return courses.filter(course => course.workflow_state === 'available');
    } catch (error) {
        console.error('Error fetching Canvas courses:', error);
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
        const response = await fetch(
            `${CANVAS_BASE_URL}/courses/${courseId}/assignments?per_page=100`,
            {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`Canvas API Error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
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
        const response = await fetch(
            `${CANVAS_BASE_URL}/courses/${courseId}/assignments/${assignmentId}/submissions/self`,
            {
                headers: {
                    'Authorization': `Bearer ${apiToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

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
        const response = await fetch(`${CANVAS_BASE_URL}/users/self`, {
            headers: {
                'Authorization': `Bearer ${apiToken}`,
                'Content-Type': 'application/json',
            },
        });

        return response.ok;
    } catch (error) {
        console.error('Error validating Canvas token:', error);
        return false;
    }
};
