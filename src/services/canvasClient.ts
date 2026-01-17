/**
 * Canvas API Client for UofT Quercus
 * 
 * A comprehensive client for interacting with the Canvas REST API
 * at https://q.utoronto.ca
 * 
 * Features:
 * - Authentication via API token
 * - Pagination handling
 * - Time zone conversion (UTC to America/Toronto)
 * - Comprehensive error handling
 * - Type-safe responses
 */

import {
  CanvasCourse,
  CanvasSubmissionWithAssignment,
  ProcessedCourse,
  ProcessedAssignmentSubmission,
} from '../types/canvas';
import {
  CanvasAPIError,
  CanvasAuthenticationError,
  CanvasPermissionError,
  CanvasNetworkError,
  createCanvasError,
} from '../utils/canvasErrors';
import { fetchAllPages } from '../utils/canvasPagination';
import {
  canvasTimestampToToronto,
  isLate,
  formatTorontoDate,
} from '../utils/canvasTime';

const CANVAS_BASE_URL = 'https://q.utoronto.ca';
const DEFAULT_PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001';
const USE_PROXY = process.env.REACT_APP_USE_PROXY !== 'false';

/**
 * Configuration for Canvas API Client
 */
export interface CanvasClientConfig {
  /** Canvas API access token */
  apiToken: string;
  /** Optional custom base URL (defaults to https://q.utoronto.ca) */
  baseUrl?: string;
  /** Optional proxy URL for CORS (defaults to http://localhost:3001) */
  proxyUrl?: string;
  /** Whether to use proxy (defaults to true) */
  useProxy?: boolean;
}

/**
 * Canvas API Client Class
 */
export class CanvasClient {
  private apiToken: string;
  private baseUrl: string;
  private proxyUrl: string;
  private useProxy: boolean;

  constructor(config: CanvasClientConfig) {
    this.apiToken = config.apiToken;
    this.baseUrl = config.baseUrl || CANVAS_BASE_URL;
    this.proxyUrl = config.proxyUrl || DEFAULT_PROXY_URL;
    this.useProxy = config.useProxy !== false && USE_PROXY;
  }

  /**
   * Makes an authenticated request to Canvas API
   * Handles proxy routing and error responses
   */
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;

    // Use proxy if enabled
    if (this.useProxy) {
      const proxyEndpoint = `${this.proxyUrl}/api/canvas${endpoint}`;
      return this.requestViaProxy<T>(proxyEndpoint, options);
    }

    // Direct request (may fail due to CORS)
    return this.requestDirect<T>(url, options);
  }

  /**
   * Makes request via proxy server
   */
  private async requestViaProxy<T>(proxyUrl: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(proxyUrl, {
        ...options,
        method: options.method || 'GET',
        headers: {
          'X-Canvas-API-Key': this.apiToken,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof CanvasAPIError) {
        throw error;
      }

      // Check if it's a proxy server issue
      if (error.message?.includes('fetch') || error.name === 'TypeError') {
        throw new CanvasNetworkError(
          'Failed to connect to proxy server. Make sure it is running (npm run server).',
          error
        );
      }

      throw new CanvasNetworkError('Network error', error);
    }
  }

  /**
   * Makes direct request to Canvas API
   */
  private async requestDirect<T>(url: string, options: RequestInit = {}): Promise<T> {
    try {
      const response = await fetch(url, {
        ...options,
        method: options.method || 'GET',
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
        mode: 'cors',
        credentials: 'omit',
      });

      return this.handleResponse<T>(response);
    } catch (error: any) {
      if (error instanceof CanvasAPIError) {
        throw error;
      }

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new CanvasNetworkError(
          'CORS error. Canvas API requires a proxy server for browser requests.',
          error
        );
      }

      throw new CanvasNetworkError('Network error', error);
    }
  }

  /**
   * Handles response and converts errors to appropriate types
   */
  private async handleResponse<T>(response: Response): Promise<T> {
    // Check content type
    const contentType = response.headers.get('content-type') || '';

    // Handle HTML responses (proxy server error)
    if (contentType.includes('text/html')) {
      const text = await response.clone().text();
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new CanvasNetworkError(
          'Proxy server returned HTML instead of JSON. Make sure the server is running.'
        );
      }
    }

    // Handle error status codes
    if (!response.ok) {
      let errorMessage: string | undefined;

      try {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message;
      } catch {
        // If response is not JSON, get text
        const text = await response.text();
        errorMessage = text.substring(0, 200);
      }

      throw createCanvasError(response.status, errorMessage);
    }

    // Parse JSON response
    if (!contentType.includes('application/json')) {
      const text = await response.text();
      throw new CanvasAPIError(
        `Expected JSON response but got ${contentType}. Response: ${text.substring(0, 100)}`
      );
    }

    return response.json();
  }

  /**
   * Fetches a paginated endpoint and returns all results
   */
  private async fetchPaginated<T>(endpoint: string, params?: Record<string, string>): Promise<T[]> {
    const queryString = params
      ? '?' + new URLSearchParams(params).toString()
      : '';
    const fullEndpoint = `${endpoint}${queryString}`;

    const firstPageUrl = this.useProxy
      ? `${this.proxyUrl}/api/canvas${fullEndpoint}`
      : `${this.baseUrl}${fullEndpoint}`;

    return fetchAllPages<T>(
      async (url: string) => {
        const response = await fetch(url, {
          method: 'GET',
          headers: this.useProxy
            ? { 'X-Canvas-API-Key': this.apiToken, 'Content-Type': 'application/json' }
            : { Authorization: `Bearer ${this.apiToken}`, 'Content-Type': 'application/json' },
        });

        if (!response.ok) {
          throw createCanvasError(response.status);
        }

        return response;
      },
      firstPageUrl
    );
  }

  /**
   * Fetches all active courses for the authenticated user
   * 
   * @returns Array of active courses
   */
  async fetchCourses(): Promise<ProcessedCourse[]> {
    try {
      const courses = await this.fetchPaginated<CanvasCourse>('/api/v1/courses', {
        enrollment_state: 'active',
        include: 'term',
        per_page: '100',
      });

      // Filter out courses without names or course codes
      const validCourses = courses.filter(
        (course) => course.name && course.course_code
      );

      // Process courses: convert timestamps to Toronto time
      return validCourses.map((course) => ({
        id: course.id,
        name: course.name,
        course_code: course.course_code,
        enrollment_term_id: course.enrollment_term_id,
        start_at: canvasTimestampToToronto(course.start_at || null),
        end_at: canvasTimestampToToronto(course.end_at || null),
      }));
    } catch (error: unknown) {
      if (error instanceof CanvasAPIError) {
        throw error;
      }
      throw new CanvasAPIError('Failed to fetch courses', undefined, error as Error);
    }
  }

  /**
   * Fetches assignments and submissions for a specific course
   * 
   * Uses the students/submissions endpoint which includes assignment metadata
   * and only returns submissions for the authenticated user
   * 
   * @param courseId - Canvas course ID
   * @returns Array of assignment submissions with metadata
   */
  async fetchCourseSubmissions(courseId: number): Promise<ProcessedAssignmentSubmission[]> {
    try {
      // Fetch submissions with assignment metadata included
      const submissions = await this.fetchPaginated<CanvasSubmissionWithAssignment>(
        `/api/v1/courses/${courseId}/students/submissions`,
        {
          include: 'assignment',
          per_page: '100',
        }
      );

      // Process submissions: extract data and convert timestamps
      return submissions.map((submission) => {
        const assignment = submission.assignment;
        const dueAt = canvasTimestampToToronto(assignment.due_at);
        const submittedAt = canvasTimestampToToronto(submission.submitted_at);

        // Determine if late (use Canvas's late flag, but also calculate our own)
        let isLateValue = submission.late;
        if (submittedAt && dueAt) {
          // Also check our calculation as validation
          const calculatedLate = isLate(submission.submitted_at, assignment.due_at);
          if (calculatedLate !== null) {
            isLateValue = calculatedLate;
          }
        }

        return {
          assignment_id: assignment.id,
          assignment_name: assignment.name,
          due_at: dueAt,
          submitted_at: submittedAt,
          score: submission.score,
          attempt: submission.attempt,
          late: isLateValue,
          workflow_state: submission.workflow_state,
          excused: submission.excused,
          missing: submission.missing,
        };
      });
    } catch (error: unknown) {
      if (error instanceof CanvasAPIError) {
        throw error;
      }
      throw new CanvasAPIError(
        `Failed to fetch submissions for course ${courseId}`,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Fetches a single course by ID
   * 
   * @param courseId - Canvas course ID
   * @returns Course details
   */
  async fetchCourse(courseId: number): Promise<ProcessedCourse> {
    try {
      const course = await this.request<CanvasCourse>(`/api/v1/courses/${courseId}`);

      return {
        id: course.id,
        name: course.name,
        course_code: course.course_code,
        enrollment_term_id: course.enrollment_term_id,
        start_at: canvasTimestampToToronto(course.start_at || null),
        end_at: canvasTimestampToToronto(course.end_at || null),
      };
    } catch (error: unknown) {
      if (error instanceof CanvasAPIError) {
        throw error;
      }
      throw new CanvasAPIError(
        `Failed to fetch course ${courseId}`,
        undefined,
        error as Error
      );
    }
  }

  /**
   * Tests the API connection
   * 
   * @returns true if connection successful
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request<{ id: number }>('/api/v1/users/self');
      return true;
    } catch (error) {
      if (error instanceof CanvasAuthenticationError) {
        return false;
      }
      throw error;
    }
  }
}

/**
 * Creates a Canvas client from environment variable or Firebase
 * For use in React components where Firebase is available
 */
export async function createCanvasClientFromFirebase(): Promise<CanvasClient> {
  // Dynamic import to avoid issues if Firebase isn't set up
  const { auth, db } = await import('../firebase/firebase');
  const { doc, getDoc } = await import('firebase/firestore');

  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    throw new Error('User document not found');
  }

  const userData = userDoc.data();
  const apiToken = userData.canvasApiKey;

  if (!apiToken) {
    throw new Error('Canvas API key not found. Please connect your Canvas account.');
  }

  return new CanvasClient({ apiToken });
}

/**
 * Creates a Canvas client from environment variable
 * For use in Node.js scripts or server-side code
 */
export function createCanvasClientFromEnv(): CanvasClient {
  const apiToken = process.env.CANVAS_API_TOKEN;

  if (!apiToken) {
    throw new Error('CANVAS_API_TOKEN environment variable is not set');
  }

  return new CanvasClient({ apiToken });
}
