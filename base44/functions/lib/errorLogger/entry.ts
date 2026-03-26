// Structured error logging for debugging
export async function logError(context, error, metadata = {}) {
  const timestamp = new Date().toISOString();
  const errorLog = {
    timestamp,
    context,
    message: error?.message || String(error),
    stack: error?.stack || '',
    metadata,
    severity: metadata.severity || 'error'
  };

  try {
    // Log to console for immediate visibility
    console.error(`[${context}]`, errorLog);

    // Optionally store in database for audit trail (if needed later)
    // await base44.entities.ErrorLog.create(errorLog);
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }

  return errorLog;
}

export function logInfo(context, message, metadata = {}) {
  console.log(`[${context}] ${message}`, metadata);
}

export function logWarning(context, message, metadata = {}) {
  console.warn(`[${context}] ${message}`, metadata);
}