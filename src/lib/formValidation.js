/**
 * Simple form validation helpers
 */

export const validators = {
  email: (value) => {
    if (!value) return 'Email is required';
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(value) ? null : 'Invalid email format';
  },

  required: (value, fieldName = 'This field') => {
    return value?.toString().trim() ? null : `${fieldName} is required`;
  },

  minLength: (min) => (value, fieldName = 'This field') => {
    return value?.length >= min ? null : `${fieldName} must be at least ${min} characters`;
  },

  maxLength: (max) => (value, fieldName = 'This field') => {
    return value?.length <= max ? null : `${fieldName} must be no more than ${max} characters`;
  },

  phone: (value) => {
    if (!value) return 'Phone is required';
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length === 10 ? null : 'Invalid phone number';
  },

  url: (value) => {
    if (!value) return 'URL is required';
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL';
    }
  },

  match: (fieldValue, otherValue, fieldName = 'Fields') => {
    return fieldValue === otherValue ? null : `${fieldName} do not match`;
  },
};

export const validateForm = (formData, schema) => {
  const errors = {};
  Object.keys(schema).forEach((field) => {
    const validator = schema[field];
    const error = validator(formData[field]);
    if (error) errors[field] = error;
  });
  return errors;
};

export const hasErrors = (errors) => Object.keys(errors).length > 0;