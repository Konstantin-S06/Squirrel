import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';

const CANVAS_DOMAIN = 'https://q.utoronto.ca';
// Backend proxy URL - change this to your production URL when deployed
const PROXY_URL = process.env.REACT_APP_PROXY_URL || 'http://localhost:3001';
const USE_PROXY = process.env.REACT_APP_USE_PROXY !== 'false'; // Default to true

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
 * Makes an authenticated request to Canvas API
 * Uses backend proxy if available, otherwise tries direct connection
 */
async function canvasRequest(endpoint: string): Promise<any> {
  const apiKey = await getCanvasApiKey();
  if (!apiKey) {
    throw new Error('Canvas API key not found. Please connect your Canvas account.');
  }

  // Use proxy if enabled
  // NOTE: In development, the React dev server's setupProxy.js automatically
  // proxies /api/* requests to the backend. So we use relative paths.
  if (USE_PROXY) {
    try {
      // Use relative path - setupProxy.js will forward to backend
      // This works in development and can be configured for production
      const proxyEndpoint = `/api/canvas${endpoint}`;
      const response = await fetch(proxyEndpoint, {
        method: 'GET',
        headers: {
          'X-Canvas-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });

      // Check content type and handle HTML responses (proxy server not running)
      const contentType = response.headers.get('content-type') || '';
      
      // Handle non-OK responses
      if (!response.ok) {
        // Clone response to read text without consuming it
        const responseClone = response.clone();
        const text = await responseClone.text();
        
        // Check if we got HTML instead of JSON (backend not running or proxy misconfigured)
        if (text.includes('<!DOCTYPE') || text.includes('<html') || contentType.includes('text/html')) {
          if (response.status === 404) {
            throw new Error(
              'Backend API endpoint not found. ' +
              'Make sure the backend server is running: npm run server'
            );
          }
          throw new Error(
            'Backend server returned HTML instead of JSON. ' +
            'This usually means the backend server is not running. ' +
            'Please start it with: npm run server (port 3001)'
          );
        }
        
        // Try to parse as JSON error
        try {
          const errorData = JSON.parse(text);
          throw new Error(errorData.error || `Canvas API error (${response.status}): ${response.statusText}`);
        } catch (parseError: any) {
          throw new Error(`Canvas API error (${response.status}): ${response.statusText}`);
        }
      }

      // Verify response is JSON before parsing
      if (!contentType.includes('application/json')) {
        const text = await response.text();
        if (text.includes('<!DOCTYPE') || text.includes('<html')) {
          throw new Error(
            'Backend server returned HTML instead of JSON. ' +
            'Please start the backend server with: npm run server'
          );
        }
        throw new Error(
          `Expected JSON response but got ${contentType}. ` +
          'Backend server may not be configured correctly.'
        );
      }

      // Parse JSON response
      return response.json();
    } catch (error: any) {
      // If proxy fails with a clear message, throw it
      if (error.message.includes('proxy server') || error.message.includes('Backend')) {
        throw error;
      }
      // Otherwise, log and fall back to direct connection attempt
      console.warn('Proxy request failed, trying direct connection:', error.message);
      // Continue to direct connection attempt below
    }
  }

  // Direct connection (may fail due to CORS)
  try {
    const response = await fetch(`${CANVAS_DOMAIN}${endpoint}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        throw new Error('Invalid Canvas API key. Please reconnect your Canvas account.');
      }
      const errorText = await response.text();
      throw new Error(`Canvas API error (${response.status}): ${response.statusText}`);
    }

    return response.json();
  } catch (error: any) {
    // Handle CORS or network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error(
        'Failed to connect to Canvas. CORS error detected. ' +
        'Please start the backend proxy server (npm run server) or ensure it\'s running.'
      );
    }
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
  // Try proxy first if enabled
  if (USE_PROXY) {
    try {
      const response = await fetch(`${PROXY_URL}/api/canvas/api/v1/users/self`, {
        method: 'GET',
        headers: {
          'X-Canvas-API-Key': apiKey,
          'Content-Type': 'application/json',
        },
      });
      
      // Check if response is HTML (proxy server error)
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        console.warn('Proxy server returned HTML, may not be running');
        return false;
      }
      
      return response.ok;
    } catch (error: any) {
      console.warn('Proxy connection test failed:', error.message);
      // Fall through to direct connection
    }
  }

  // Try direct connection
  try {
    const response = await fetch(`${CANVAS_DOMAIN}/api/v1/users/self`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'omit',
    });

    return response.ok;
  } catch (error) {
    console.error('Canvas connection test error:', error);
    return false;
  }
}

/**
 * Fetches all active courses for the current user from Canvas
 * Uses access_token as query parameter via backend proxy to avoid CORS
 */
export async function fetchCanvasCourses(): Promise<CanvasCourse[]> {
  try {
    // Get API token from Firebase
    const apiKey = await getCanvasApiKey();
    if (!apiKey) {
      throw new Error('Canvas API key not found. Please connect your Canvas account.');
    }

    // Use backend proxy to avoid CORS issues
    // The proxy server makes the request server-side where CORS doesn't apply
    const proxyUrl = `${PROXY_URL}/api/canvas/courses?access_token=${apiKey}&enrollment_state=active&per_page=100`;
    
    console.log('🔍 Making Canvas API call via proxy:');
    console.log('   URL:', proxyUrl.replace(apiKey, '***'));
    console.log('   API Key length:', apiKey.length);
    console.log('   API Key first 10 chars:', apiKey.substring(0, 10));
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

    // Check if we got HTML (backend not running)
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      const text = await response.text();
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error(
          'Backend server not running. ' +
          'Please start it with: npm install && npm run server'
        );
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        throw new Error(errorData.error || `Canvas API error (${response.status}): ${response.statusText}`);
      } catch {
        throw new Error(`Canvas API error (${response.status}): ${errorText || response.statusText}`);
      }
    }

    const courses = await response.json();
    
    console.log('✅ Canvas API call successful!');
    console.log(`Received ${courses.length} courses:`, courses);
    
    // Filter out courses without names (deleted/invalid courses)
    const validCourses = courses.filter((course: CanvasCourse) => course.name && course.course_code);
    console.log(`Filtered to ${validCourses.length} valid courses`);
    
    return validCourses;
  } catch (error: any) {
    console.error('❌ Error fetching Canvas courses:', error);
    
    // Provide helpful error message
    if (error.message.includes('fetch') || error.name === 'TypeError') {
      throw new Error(
        'Failed to connect to backend server. ' +
        'Make sure the backend is running: npm install && npm run server'
      );
    }
    
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
