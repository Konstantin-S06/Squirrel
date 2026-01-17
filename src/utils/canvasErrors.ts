/**
 * Canvas API Error Handling
 * 
 * Custom error classes and utilities for Canvas API errors
 */

export class CanvasAPIError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'CanvasAPIError';
    Object.setPrototypeOf(this, CanvasAPIError.prototype);
  }
}

export class CanvasAuthenticationError extends CanvasAPIError {
  constructor(message: string = 'Invalid Canvas API token') {
    super(message, 401);
    this.name = 'CanvasAuthenticationError';
  }
}

export class CanvasPermissionError extends CanvasAPIError {
  constructor(message: string = 'Permission denied. You may not have access to this resource.') {
    super(message, 403);
    this.name = 'CanvasPermissionError';
  }
}

export class CanvasNotFoundError extends CanvasAPIError {
  constructor(message: string = 'Resource not found') {
    super(message, 404);
    this.name = 'CanvasNotFoundError';
  }
}

export class CanvasRateLimitError extends CanvasAPIError {
  constructor(message: string = 'Canvas API rate limit exceeded. Please wait before retrying.') {
    super(message, 429);
    this.name = 'CanvasRateLimitError';
  }
}

export class CanvasNetworkError extends CanvasAPIError {
  constructor(message: string = 'Network error while connecting to Canvas API', originalError?: Error) {
    super(message, undefined, originalError);
    this.name = 'CanvasNetworkError';
  }
}

/**
 * Maps HTTP status codes to appropriate error types
 */
export function createCanvasError(statusCode: number, message?: string): CanvasAPIError {
  switch (statusCode) {
    case 401:
      return new CanvasAuthenticationError(message);
    case 403:
      return new CanvasPermissionError(message);
    case 404:
      return new CanvasNotFoundError(message);
    case 429:
      return new CanvasRateLimitError(message);
    default:
      return new CanvasAPIError(
        message || `Canvas API error (${statusCode})`,
        statusCode
      );
  }
}

/**
 * Checks if an error is a Canvas API error
 */
export function isCanvasError(error: unknown): error is CanvasAPIError {
  return error instanceof CanvasAPIError;
}
