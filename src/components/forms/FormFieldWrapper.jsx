import React from 'react';

/**
 * Wraps form fields to provide consistent validation styling
 * Shows red border when required field is empty and touched
 */
export default function FormFieldWrapper({
  label,
  required = false,
  isInvalid = false,
  children,
  helperText = null,
  className = '',
}) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-semibold text-slate-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={isInvalid ? 'ring-2 ring-red-500 rounded-lg' : ''}>
        {children}
      </div>
      {isInvalid && (
        <p className="text-xs text-red-600 mt-1 font-medium">This field is required</p>
      )}
      {helperText && !isInvalid && (
        <p className="text-xs text-slate-500 mt-1">{helperText}</p>
      )}
    </div>
  );
}