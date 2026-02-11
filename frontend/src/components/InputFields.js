import React from 'react';

/**
 * InputField - Mobile-friendly input component
 */
export const InputField = ({
  label,
  name,
  type = 'text',
  value = '',
  onChange,
  onBlur = null,
  placeholder = '',
  required = false,
  error = '',
  helperText = '',
  disabled = false,
  icon = null,
  ...props
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-earth-500">
            {icon}
          </div>
        )}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`input ${icon ? 'pl-12' : ''} ${
            error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
          }`}
          {...props}
        />
      </div>
      {error && <p className="text-red-600 text-xs md:text-xs mt-1 font-medium">{error}</p>}
      {helperText && !error && (
        <p className="text-earth-500 text-xs md:text-xs mt-1">{helperText}</p>
      )}
    </div>
  );
};

/**
 * SelectField - Mobile-friendly select component
 */
export const SelectField = ({
  label,
  name,
  value = '',
  onChange,
  onBlur = null,
  options = [],
  required = false,
  error = '',
  disabled = false,
  placeholder = 'Select an option',
  ...props
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        className={`input cursor-pointer ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        }`}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.id || option.value} value={option.value || option.id}>
            {option.label || option.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-600 text-xs md:text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};

/**
 * TextAreaField - Mobile-friendly textarea component
 */
export const TextAreaField = ({
  label,
  name,
  value = '',
  onChange,
  placeholder = '',
  required = false,
  error = '',
  disabled = false,
  rows = 4,
  ...props
}) => {
  return (
    <div className="input-group">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="text-red-600 ml-1">*</span>}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`input resize-none ${
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
        }`}
        {...props}
      />
      {error && <p className="text-red-600 text-xs md:text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};

/**
 * CheckboxField - Mobile-friendly checkbox component
 */
export const CheckboxField = ({
  label,
  name,
  checked = false,
  onChange,
  disabled = false,
  error = '',
  ...props
}) => {
  return (
    <div className="input-group">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          name={name}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="w-6 h-6 rounded border-2 border-earth-200 text-primary-600 focus:ring-primary-500 cursor-pointer"
          {...props}
        />
        <span className="text-base md:text-sm text-earth-700 font-medium">
          {label}
        </span>
      </label>
      {error && <p className="text-red-600 text-xs md:text-xs mt-1 font-medium">{error}</p>}
    </div>
  );
};

/**
 * RadioField - Mobile-friendly radio component
 */
export const RadioField = ({
  label,
  name,
  value,
  checked = false,
  onChange,
  disabled = false,
  ...props
}) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer mb-3">
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className="w-6 h-6 rounded-full border-2 border-earth-200 text-primary-600 focus:ring-primary-500 cursor-pointer"
        {...props}
      />
      <span className="text-base md:text-sm text-earth-700 font-medium">
        {label}
      </span>
    </label>
  );
};

/**
 * Form - Container for form elements
 */
export const Form = ({
  children,
  onSubmit,
  className = '',
  ...props
}) => {
  return (
    <form onSubmit={onSubmit} className={`space-y-0 ${className}`} {...props}>
      {children}
    </form>
  );
};

export default {
  InputField,
  SelectField,
  TextAreaField,
  CheckboxField,
  RadioField,
  Form,
};
