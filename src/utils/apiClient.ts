/**
 * API Client Utility
 * 
 * Provides a centralized way to make API requests with:
 * - Automatic error detection (HTML vs JSON responses)
 * - Clear error messages if backend is unreachable
 * - Proper error handling
 * 
 * PROBLEM FIXED:
 * - Before: Frontend received HTML (index.html) from React dev server when backend was down
 * - After: Frontend detects HTML responses and shows clear error message
 */

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  ok: boolean;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public responseText?: string,
    public isHtml?: boolean
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Makes a fetch request to the API with error detection
 * 
 * @param endpoint - API endpoint (e.g., '/api/health')
 * @param options - Fetch options
 * @returns Promise with parsed JSON response
 * @throws ApiError if request fails or returns HTML
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    // Get content type
    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');

    // Clone response for error checking
    const responseClone = response.clone();

    // Check if we got HTML instead of JSON
    if (!isJson) {
      const text = await responseClone.text();
      
      // Detect HTML response (backend not running or wrong endpoint)
      if (text.includes('<!DOCTYPE') || text.includes('<html') || text.includes('<head>')) {
        throw new ApiError(
          'Backend server returned HTML instead of JSON. ' +
          'This usually means the backend server is not running. ' +
          'Please start it with: npm run server',
          response.status,
          text.substring(0, 200),
          true
        );
      }

      // If not HTML but also not JSON, it's still an error
      throw new ApiError(
        `Expected JSON response but got ${contentType}`,
        response.status,
        text.substring(0, 200),
        false
      );
    }

    // Parse JSON response
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        error: 'Unknown error',
        message: `HTTP ${response.status}: ${response.statusText}`,
      }));

      throw new ApiError(
        errorData.message || errorData.error || `API request failed: ${response.statusText}`,
        response.status,
        JSON.stringify(errorData)
      );
    }

    return response.json();
  } catch (error: unknown) {
    // Re-throw ApiError as-is
    if (error instanceof ApiError) {
      throw error;
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Failed to connect to backend server. ' +
        'Make sure the backend is running on port 3001: npm run server',
        undefined,
        undefined,
        false
      );
    }

    // Wrap other errors
    throw new ApiError(
      `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      undefined,
      undefined,
      false
    );
  }
}

/**
 * Health check - tests if backend server is reachable
 */
export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await apiRequest<{ status: string }>('/api/health');
    return response.status === 'ok';
  } catch (error) {
    console.error('Backend health check failed:', error);
    return false;
  }
}
