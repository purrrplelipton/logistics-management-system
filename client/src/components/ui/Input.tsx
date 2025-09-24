'use client';

import React, { forwardRef, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  startElement?: ReactNode;
  endElement?: ReactNode;
  error?: string;
  label?: string;
  containerClassName?: string;
  labelClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    startIcon, 
    endIcon, 
    startElement, 
    endElement, 
    error, 
    label, 
    containerClassName,
    labelClassName,
    id,
    required,
    'aria-describedby': ariaDescribedBy,
    ...props 
  }, ref) => {
    const inputId = id || `input-${Math.random().toString(36).substring(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const finalAriaDescribedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn("w-full", containerClassName)}>
        {label && (
          <label 
            htmlFor={inputId} 
            className={cn("block text-sm font-medium text-gray-700 mb-1", labelClassName)}
          >
            {label} {required && <span className="text-red-500" aria-label="required">*</span>}
          </label>
        )}
        
        <div className={cn(
          "flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors",
          {
            "border-red-300 focus-within:border-red-500 focus-within:ring-red-500": error,
            "border-gray-300": !error
          }
        )}>
          {(startIcon || startElement) && (
            <div className="flex items-center pl-3 flex-shrink-0">
              {startIcon && (
                <span className="h-5 w-5 text-gray-400" aria-hidden="true">
                  {startIcon}
                </span>
              )}
              {startElement}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              "flex-1 min-w-0 py-2 px-3 bg-transparent border-0 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-0 sm:text-sm",
              {
                "text-red-900 placeholder-red-300": error,
              },
              className
            )}
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={finalAriaDescribedBy}
            {...props}
          />
          
          {(endIcon || endElement) && (
            <div className="flex items-center pr-3 flex-shrink-0">
              {endIcon && (
                <span className="h-5 w-5 text-gray-400" aria-hidden="true">
                  {endIcon}
                </span>
              )}
              {endElement}
            </div>
          )}
        </div>
        
        {error && (
          <p 
            id={errorId} 
            role="alert" 
            className="mt-1 text-sm text-red-600"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };