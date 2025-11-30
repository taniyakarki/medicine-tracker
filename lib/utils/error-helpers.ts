/**
 * Error handling utilities
 */

/**
 * Formats error message for user display
 * @param error - Error object or string
 * @param defaultMessage - Default message if error is undefined
 * @returns User-friendly error message
 */
export const formatErrorMessage = (
  error: unknown,
  defaultMessage: string = 'An unexpected error occurred'
): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return defaultMessage;
};

/**
 * Logs error with context
 * @param context - Context where error occurred
 * @param error - Error object
 * @param additionalInfo - Additional information
 */
export const logError = (
  context: string,
  error: unknown,
  additionalInfo?: Record<string, any>
): void => {
  console.error(`[${context}]`, error);
  
  if (additionalInfo) {
    console.error('Additional info:', additionalInfo);
  }

  // In production, you could send this to an error tracking service
  // Example: Sentry.captureException(error, { tags: { context }, extra: additionalInfo });
};

/**
 * Wraps an async function with error handling
 * @param fn - Async function to wrap
 * @param context - Context for error logging
 * @returns Wrapped function
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context: string
): T => {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(context, error, { args });
      throw error;
    }
  }) as T;
};

/**
 * Safely parses JSON with error handling
 * @param json - JSON string to parse
 * @param defaultValue - Default value if parsing fails
 * @returns Parsed object or default value
 */
export const safeJsonParse = <T = any>(
  json: string,
  defaultValue: T
): T => {
  try {
    return JSON.parse(json) as T;
  } catch (error) {
    logError('JSON Parse', error, { json });
    return defaultValue;
  }
};

/**
 * Validates required fields in an object
 * @param obj - Object to validate
 * @param requiredFields - Array of required field names
 * @returns Object with isValid flag and missing fields
 */
export const validateRequiredFields = <T extends Record<string, any>>(
  obj: T,
  requiredFields: (keyof T)[]
): { isValid: boolean; missingFields: string[] } => {
  const missingFields = requiredFields.filter(
    field => obj[field] === undefined || obj[field] === null || obj[field] === ''
  );

  return {
    isValid: missingFields.length === 0,
    missingFields: missingFields.map(String),
  };
};

/**
 * Creates a safe async operation with timeout
 * @param operation - Async operation
 * @param timeoutMs - Timeout in milliseconds
 * @param timeoutMessage - Message for timeout error
 * @returns Promise that rejects on timeout
 */
export const withTimeout = <T>(
  operation: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string = 'Operation timed out'
): Promise<T> => {
  return Promise.race([
    operation,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(timeoutMessage)), timeoutMs)
    ),
  ]);
};

