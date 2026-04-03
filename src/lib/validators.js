// Centralized validation utilities for input sanitization and data validation

export const validators = {
  // Email validation (RFC 5322 simplified)
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(value) && value.length > 5 ? null : 'Invalid email format';
  },

  // Required field
  required: (value, fieldName = 'This field') => {
    return value && String(value).trim() !== '' ? null : `${fieldName} is required`;
  },

  // Phone number (international: 7-15 digits)
  phone: (value) => {
    const digitsOnly = value?.replace(/\D/g, '') || '';
    return digitsOnly.length >= 7 && digitsOnly.length <= 15 ? null : 'Phone must be 7-15 digits';
  },

  // Number range
  numberRange: (value, min, max) => {
    const num = Number(value);
    if (isNaN(num)) return 'Must be a number';
    if (num < min || num > max) return `Must be between ${min} and ${max}`;
    return null;
  },

  // String length
  stringLength: (value, min, max) => {
    const len = String(value).length;
    if (len < min) return `Must be at least ${min} characters`;
    if (len > max) return `Must be no more than ${max} characters`;
    return null;
  },

  // URL validation
  url: (value) => {
    try {
      new URL(value);
      return null;
    } catch {
      return 'Invalid URL format';
    }
  },

  // Date validation
  date: (value) => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date) ? null : 'Invalid date format';
  },

  // Future date
  futureDate: (value) => {
    const date = new Date(value);
    return date > new Date() ? null : 'Date must be in the future';
  },

  // Credit card (Luhn check)
  creditCard: (value) => {
    const cc = String(value).replace(/\s+/g, '');
    if (!/^\d{13,19}$/.test(cc)) return 'Invalid card number';
    
    let sum = 0;
    let isEven = false;
    for (let i = cc.length - 1; i >= 0; i--) {
      let digit = parseInt(cc[i], 10);
      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      isEven = !isEven;
    }
    return sum % 10 === 0 ? null : 'Invalid card number';
  },
};

// Sanitization utilities
export const sanitize = {
  // Remove HTML tags
  stripHtml: (value) => {
    return String(value).replace(/<[^>]*>/g, '');
  },

  // Trim whitespace
  trim: (value) => {
    return String(value).trim();
  },

  // Remove special characters except allowed ones
  alphanumeric: (value, allowedChars = '') => {
    const regex = new RegExp(`[^a-zA-Z0-9${allowedChars}]`, 'g');
    return String(value).replace(regex, '');
  },

  // Normalize email (lowercase, trim)
  email: (value) => {
    return String(value).toLowerCase().trim();
  },

  // Normalize phone (remove non-digits except formatting)
  phone: (value) => {
    return String(value).replace(/\D+/g, '');
  },

  // Convert to number safely
  toNumber: (value) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  },
};

// Batch validation helper
export const validateFields = (data, schema) => {
  const errors = {};
  Object.entries(schema).forEach(([field, rules]) => {
    const value = data[field];
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        errors[field] = error;
        break;
      }
    }
  });
  return errors;
};