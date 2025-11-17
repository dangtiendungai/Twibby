"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = true,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const fieldId = id || `field-${Math.random().toString(36).substr(2, 9)}`;

    const baseInputStyles =
      "px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";

    const inputStyles = error
      ? `${baseInputStyles} border-red-500 dark:border-red-500`
      : `${baseInputStyles} border-gray-300 dark:border-gray-700`;

    const widthClass = fullWidth ? "w-full" : "";

    return (
      <div className={`flex flex-col ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          className={`${inputStyles} ${widthClass} ${className}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={
            error || helperText
              ? `${fieldId}-${error ? "error" : "helper"}`
              : undefined
          }
          {...props}
        />
        {helperText && !error && (
          <p
            id={`${fieldId}-helper`}
            className="mt-1 text-xs text-gray-500 dark:text-gray-400"
          >
            {helperText}
          </p>
        )}
        {error && (
          <p
            id={`${fieldId}-error`}
            className="mt-1 text-xs text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

TextField.displayName = "TextField";

export default TextField;
