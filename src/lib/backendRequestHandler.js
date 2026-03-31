// Standardized backend request handler with auth, validation, and error logging

export const createRequestHandler = (config) => {
  const {
    requireAuth = true,
    requireAdmin = false,
    validateSchema = null,
    handler
  } = config;

  return async (req) => {
    let base44 = null;
    let user = null;

    try {
      const { createClientFromRequest } = await import('npm:@base44/sdk@0.8.23');
      base44 = createClientFromRequest(req);

      // Authentication
      if (requireAuth) {
        user = await base44.auth.me();
        if (!user) {
          return Response.json(
            { error: 'Authentication required. Please log in to proceed.', code: 'UNAUTHORIZED' },
            { status: 401 }
          );
        }

        if (requireAdmin && user.role !== 'admin') {
          return Response.json(
            { error: 'Admin access required.', code: 'FORBIDDEN' },
            { status: 403 }
          );
        }
      }

      // Parse body
      const body = await req.json().catch(() => ({}));

      // Validation
      if (validateSchema) {
        const errors = {};
        for (const [field, validator] of Object.entries(validateSchema)) {
          const error = validator(body[field]);
          if (error) errors[field] = error;
        }
        if (Object.keys(errors).length > 0) {
          return Response.json(
            { error: 'Validation failed', code: 'BAD_REQUEST', details: errors },
            { status: 400 }
          );
        }
      }

      // Call handler
      const result = await handler({ base44, user, body, req });
      return result;

    } catch (error) {
      console.error('[requestHandler] Error:', error.message, error.stack);

      // Log to ErrorLog
      if (base44) {
        try {
          await base44.asServiceRole.entities.ErrorLog.create({
            message: error.message || 'Unknown error',
            stack: (error.stack || '').substring(0, 1000),
            level: 'error',
            type: 'requestHandler',
            metadata: {
              userId: user?.email || 'anonymous',
              timestamp: new Date().toISOString()
            }
          }).catch(() => {});
        } catch (logError) {
          console.error('[requestHandler] Failed to log error:', logError.message);
        }
      }

      return Response.json(
        { error: 'An unexpected server error occurred.', code: 'INTERNAL_SERVER_ERROR' },
        { status: 500 }
      );
    }
  };
};