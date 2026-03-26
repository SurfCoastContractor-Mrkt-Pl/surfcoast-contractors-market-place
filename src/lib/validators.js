// Centralized input validation & sanitization utility
export const validators = {
  email: (value) => {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(trimmed) ? trimmed : null;
  },

  phone: (value) => {
    if (!value || typeof value !== 'string') return null;
    const cleaned = value.replace(/\D/g, '');
    return cleaned.length >= 10 && cleaned.length <= 15 ? cleaned : null;
  },

  string: (value, maxLength = 500) => {
    if (!value || typeof value !== 'string') return null;
    const trimmed = value.trim().substring(0, maxLength);
    return trimmed.replace(/[\x00-\x1F\x7F]/g, '').trim() || null;
  },

  url: (value) => {
    if (!value || typeof value !== 'string') return null;
    try {
      const url = new URL(value);
      return url.href;
    } catch {
      return null;
    }
  },

  number: (value, min = -Infinity, max = Infinity) => {
    const num = Number(value);
    return !isNaN(num) && num >= min && num <= max ? num : null;
  },

  date: (value) => {
    if (!value) return null;
    const date = new Date(value);
    return !isNaN(date.getTime()) ? date.toISOString().split('T')[0] : null;
  },

  currency: (value) => {
    const num = Number(value);
    return !isNaN(num) && num >= 0 && num <= 999999.99 ? Math.round(num * 100) / 100 : null;
  },

  enum: (value, allowedValues) => {
    return allowedValues.includes(value) ? value : null;
  }
};

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