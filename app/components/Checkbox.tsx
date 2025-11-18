"use client";

import { forwardRef, useId, useState } from "react";
import { Check } from "lucide-react";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  error?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      error,
      className = "",
      id,
      checked,
      defaultChecked,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isChecked, setIsChecked] = useState(defaultChecked || false);
    const isControlled = checked !== undefined;
    const checkedState = isControlled ? checked : isChecked;
    const generatedId = useId();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setIsChecked(e.target.checked);
      }
      onChange?.(e);
    };

    const checkboxId = id || generatedId;

    return (
      <div className="flex flex-col">
        <div className="flex items-start">
          <div className="relative flex items-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              checked={checkedState}
              onChange={handleChange}
              className="sr-only peer"
              {...props}
            />
            <label
              htmlFor={checkboxId}
              className={`relative flex items-center justify-center w-5 h-5 rounded border-2 cursor-pointer transition-all duration-200 ${
                checkedState
                  ? "bg-blue-500 border-blue-500 dark:bg-blue-600 dark:border-blue-600"
                  : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500"
              } ${
                error ? "border-red-500 dark:border-red-500" : ""
              } peer-focus:ring-2 peer-focus:ring-blue-500 peer-focus:ring-offset-2 peer-focus:outline-none ${className}`}
            >
              {checkedState && (
                <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
              )}
            </label>
          </div>
          {label && (
            <label
              htmlFor={checkboxId}
              className={`ml-3 block text-sm cursor-pointer select-none ${
                error
                  ? "text-red-600 dark:text-red-400"
                  : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {label}
            </label>
          )}
        </div>
        {error && (
          <p className="mt-1 ml-8 text-sm text-red-600 dark:text-red-400">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
