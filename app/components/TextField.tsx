"use client";

import { forwardRef, InputHTMLAttributes, useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

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
      type = "text",
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const isPasswordField = type === "password";
    const resolvedType = isPasswordField && isPasswordVisible ? "text" : type;

    const baseInputStyles =
      "px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition";

    const inputStyles = error
      ? `${baseInputStyles} border-red-500 dark:border-red-500`
      : `${baseInputStyles} border-gray-300 dark:border-gray-700`;

    const widthClass = fullWidth ? "w-full" : "";
    const passwordPadding = isPasswordField ? "pr-12" : "";

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
        <div className={`relative ${widthClass}`}>
          <input
            ref={ref}
            id={fieldId}
            type={resolvedType}
            className={`${inputStyles} ${passwordPadding} ${widthClass} ${className}`}
            aria-invalid={error ? "true" : "false"}
            aria-describedby={
              error || helperText
                ? `${fieldId}-${error ? "error" : "helper"}`
                : undefined
            }
            {...props}
          />
          {isPasswordField && (
            <button
              type="button"
              onClick={() => setIsPasswordVisible((prev) => !prev)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-100"
              aria-label={isPasswordVisible ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {isPasswordVisible ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
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
