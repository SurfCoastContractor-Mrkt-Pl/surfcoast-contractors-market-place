// Centralized input validation & sanitization utility
export const validators = {
  // Email validation
  email: (value) => {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) ? trimmed : null;
  },

  // Phone validation (basic)
  phone: (value) => {
    if (!value || typeof value !== 'string') return null;
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15 ? cleaned : null;
  },

  // String sanitization (remove dangerous chars)
  string: (value, maxLength = 500) => {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim().substring(0, maxLength);
    // Remove null bytes and control characters
    return trimmed.replace(/[\x00-\x1F\x7F]/g, '').trim() || null;
  },

  // URL validation
  url: (value) => {
    if (!value || typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.href;
    } catch {
      return null;
    }
  },

  // Number validation
  number: (value, min = -Infinity, max = Infinity) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max ? num : null;
  },

  // Date validation
  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
  },

  // Currency validation
  currency: (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 999999.99 ? Math.round(num * 100) / 100 : null;
  },

  // Array validation
  array: (value, itemValidator = null, maxLength = 100) => {
    if (!Array.isArray(value) || value.length > maxLength) return null;
    if (itemValidator) {
      return value.every(item => itemValidator(item) !== null) ? value : null;
    }
    return value;
  },

  // Enum validation
  enum: (value, allowedValues) => {
    return allowedValues.includes(value) ? value : null;
  },

  // Object validation
  object: (value, schema) => {
    if (typeof value !== 'object' || value === null) return null;
    const validated = {};
    for (const [key, validator] of Object.entries(schema)) {
      if (!(key in value)) return null;
      const result = validator(value[key]);
      if (result === null) return null;
      validated[key] = result;
    }
    return validated;
  }
};

// Batch validate an object against a schema
export function validatePayload(data, schema) {
  if (typeof data !== 'object' || data === null) {
    return { valid: false, data: null, errors: ['Invalid payload'] };
  }

  const validated = {};
  const errors = [];

  for (const [field, validator] of Object.entries(schema)) {
    if (!(field in data)) {
      errors.push(`Missing required field: ${field}`);
      continue;
    }

    const result = validator(data[field]);
    if (result === null) {
      errors.push(`Invalid value for field: ${field}`);
      continue;
    }

    validated[field] = result;
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? validated : null,
    errors
  };
}

// SQL injection prevention
export function escapeSQL(value) {
  if (typeof value !== 'string') return '';
  return value.replace(/'/g, "''").replace(/"/g, '""');
}