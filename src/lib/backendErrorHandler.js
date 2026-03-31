/**
 * Centralized Backend Error Handler
 * Provides consistent error handling, logging, and response formatting for all backend functions
 */

/**
 * Log error to ErrorLog entity via service role
 * @param {Object} base44 - Base44 SDK client instance (service role)
 * @param {string} message - Error message
 * @param {string} stack - Error stack trace
 * @param {Object} context - Additional context (functionName, payload, userId, etc.)
 * @param {string} level - Error level ('error', 'warning', 'critical')
 */
export async function logErrorToDatabase(base44, message, stack, context = {}, level = 'error') {
  try {
    if (!base44 || !message) return; // Silent fail to avoid recursive errors

    const errorRecord = {
      message: message.substring(0, 500), // Limit message length
      stack: stack ? stack.substring(0, 2000) : '',
      level,
      type: context.functionName || 'unknown_function',
      metadata: {
        functionName: context.functionName || 'unknown',
        userId: context.userId || 'anonymous',
        timestamp: new Date().toISOString(),
        ...context
      }
    };

    await base44.asServiceRole.entities.ErrorLog.create(errorRecord);
  } catch (logError) {
    // Log to console if database logging fails
    console.error('Failed to log error to database:', logError.message);
  }
}

/**
 * Standard error response for 401 Unauthorized
 */
export function unauthorized401(message = 'Authentication required') {
  return Response.json(
    {
      error: message,
      code: 'UNAUTHORIZED'
    },
    { status: 401 }
  );
}

/**
 * Standard error response for 403 Forbidden
 */
export function forbidden403(message = 'Access denied. You do not have permission to perform this action') {
  return Response.json(
    {
      error: message,
      code: 'FORBIDDEN'
    },
    { status: 403 }
  );
}

/**
 * Standard error response for 400 Bad Request
 */
export function badRequest400(message = 'Invalid request') {
  return Response.json(
    {
      error: message,
      code: 'BAD_REQUEST'
    },
    { status: 400 }
  );
}

/**
 * Standard error response for 500 Internal Server Error
 */
export function internalError500(message = 'An unexpected server error occurred') {
  return Response.json(
    {
      error: message,
      code: 'INTERNAL_SERVER_ERROR'
    },
    { status: 500 }
  );
}

/**
 * Wrapper for backend function execution with comprehensive error handling
 * @param {Function} handler - The async handler function
 * @param {Object} options - Configuration options
 */
export async function withErrorHandling(handler, options = {}) {
  const {
    functionName = 'unknown',
    requireAuth = true,
    requireAdmin = false,
    logToDatabase = true
  } = options;

  return async (req) => {
    let base44 = null;
    let user = null;

    try {
      const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.23');
      base44 = createClientFromRequest(req);

      // Authentication check
      if (requireAuth) {
        user = await base44.auth.me();
        if (!user) {
          return unauthorized401('Please log in to proceed.');
        }
      }

      // Admin check
      if (requireAdmin) {
        user = user || (await base44.auth.me());
        if (!user || user.role !== 'admin') {
          return forbidden403('Admin access required.');
        }
      }

      // Execute the handler
      return await handler({
        base44,
        user,
        req
      });
    } catch (error) {
      console.error(`[${functionName}] Error:`, error.message);

      // Log to database if enabled
      if (logToDatabase && base44) {
        await logErrorToDatabase(
          base44,
          error.message,
          error.stack,
          {
            functionName,
            userId: user?.email || 'anonymous',
            errorType: error.constructor.name
          },
          'error'
        );
      }

      // Return user-friendly error response
      return internalError500(
        'An unexpected server error occurred. Please try again later.'
      );
    }
  };
}