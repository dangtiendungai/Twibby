"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "fill" | "outline" | "text" | "icon";
  color?: "primary" | "secondary" | "danger" | "success" | "gray";
  size?: "sm" | "md" | "lg";
  rounded?: boolean | "full" | "lg" | "md" | "sm" | "none";
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "fill",
      color = "primary",
      size = "md",
      rounded = "lg",
      isLoading = false,
      fullWidth = false,
      className = "",
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    // Base styles
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

    // Rounded styles
    const roundedStyles = {
      full: "rounded-full",
      lg: "rounded-lg",
      md: "rounded-md",
      sm: "rounded-sm",
      none: "rounded-none",
    };
    const roundedClass =
      typeof rounded === "boolean"
        ? rounded
          ? "rounded-full"
          : "rounded-lg"
        : roundedStyles[rounded];

    // Size styles
    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2.5 text-sm",
      lg: "px-6 py-3 text-base",
    };

    // Color styles for fill variant
    const fillColors = {
      primary: "bg-blue-500 hover:bg-blue-600 text-white border border-transparent",
      secondary: "bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 border border-transparent",
      danger: "bg-red-500 hover:bg-red-600 text-white border border-transparent",
      success: "bg-green-500 hover:bg-green-600 text-white border border-transparent",
      gray: "bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 border border-transparent",
    };

    // Color styles for outline variant
    const outlineColors = {
      primary: "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-500 dark:border-blue-500",
      secondary: "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700",
      danger: "bg-transparent hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 border border-red-500 dark:border-red-500",
      success: "bg-transparent hover:bg-green-50 dark:hover:bg-green-950 text-green-600 dark:text-green-400 border border-green-500 dark:border-green-500",
      gray: "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700",
    };

    // Color styles for text variant
    const textColors = {
      primary: "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 border border-transparent",
      secondary: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent",
      danger: "bg-transparent hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 border border-transparent",
      success: "bg-transparent hover:bg-green-50 dark:hover:bg-green-950 text-green-600 dark:text-green-400 border border-transparent",
      gray: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border border-transparent",
    };

    // Color styles for icon variant
    const iconColors = {
      primary: "bg-transparent hover:bg-blue-50 dark:hover:bg-blue-950 text-blue-600 dark:text-blue-400 border border-transparent",
      secondary: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent",
      danger: "bg-transparent hover:bg-red-50 dark:hover:bg-red-950 text-red-600 dark:text-red-400 border border-transparent",
      success: "bg-transparent hover:bg-green-50 dark:hover:bg-green-950 text-green-600 dark:text-green-400 border border-transparent",
      gray: "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 border border-transparent",
    };

    // Variant styles
    const getVariantStyles = () => {
      switch (variant) {
        case "fill":
          return fillColors[color];
        case "outline":
          return outlineColors[color];
        case "text":
          return textColors[color];
        case "icon":
          return iconColors[color];
        default:
          return fillColors[color];
      }
    };

    // Focus ring color
    const focusRingColors = {
      primary: "focus:ring-blue-500",
      secondary: "focus:ring-gray-500",
      danger: "focus:ring-red-500",
      success: "focus:ring-green-500",
      gray: "focus:ring-gray-500",
    };

    const widthClass = fullWidth ? "w-full" : "";
    const sizeClass = variant === "icon" ? "p-2" : sizes[size];

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${roundedClass} ${getVariantStyles()} ${sizeClass} ${focusRingColors[color]} ${widthClass} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
