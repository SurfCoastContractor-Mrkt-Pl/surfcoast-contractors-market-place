import { useState } from 'react';

/**
 * Hook to track required field validation across a form
 * Returns a function to check if a field is empty and required
 * @param {Object} formData - Form data object
 * @param {Array<string>} requiredFields - Array of required field names
 * @returns {Object} { isFieldEmpty, getFieldClass }
 */
export function useRequiredFieldValidation(formData, requiredFields = []) {
  const [touched, setTouched] = useState({});

  const isFieldEmpty = (fieldName) => {
    const value = formData[fieldName];
    if (typeof value === 'string') {
      return value.trim() === '';
    }
    if (Array.isArray(value)) {
      return value.length === 0;
    }
    return !value;
  };

  const isFieldRequired = (fieldName) => {
    return requiredFields.includes(fieldName);
  };

  const isFieldInvalid = (fieldName) => {
    return isFieldRequired(fieldName) && isFieldEmpty(fieldName) && touched[fieldName];
  };

  const markFieldTouched = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
  };

  const getFieldClass = (fieldName) => {
    return isFieldInvalid(fieldName) ? 'border-2 border-red-500' : '';
  };

  return {
    isFieldEmpty,
    isFieldRequired,
    isFieldInvalid,
    markFieldTouched,
    getFieldClass,
    touched,
  };
}