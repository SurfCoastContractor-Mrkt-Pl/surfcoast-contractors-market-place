import { useState, useCallback } from 'react';
import { getErrorMessage, logError } from '@/lib/errorHandler';

/**
 * Hook for managing form-level and field-level errors
 */
export function useFormErrors() {
  const [formError, setFormError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const setError = useCallback((error, context = 'Form') => {
    const message = getErrorMessage(error);
    logError(context, error);
    setFormError(message);
  }, []);

  const setFieldError = useCallback((fieldName, error) => {
    const message = typeof error === 'string' ? error : getErrorMessage(error);
    setFieldErrors(prev => ({
      ...prev,
      [fieldName]: message
    }));
  }, []);

  const clearError = useCallback(() => {
    setFormError(null);
  }, []);

  const clearFieldError = useCallback((fieldName) => {
    setFieldErrors(prev => {
      const updated = { ...prev };
      delete updated[fieldName];
      return updated;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFormError(null);
    setFieldErrors({});
  }, []);

  const getFieldError = useCallback((fieldName) => {
    return fieldErrors[fieldName] || null;
  }, [fieldErrors]);

  const hasErrors = formError || Object.keys(fieldErrors).length > 0;

  return {
    formError,
    fieldErrors,
    setError,
    setFieldError,
    clearError,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasErrors,
  };
}