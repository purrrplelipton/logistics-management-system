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
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
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
        
        <div className="relative">
          {(startIcon || startElement) && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
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
              "appearance-none relative block w-full py-2 px-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-colors",
              {
                "pl-10": startIcon || startElement,
                "pr-10": endIcon || endElement,
                "border-red-300 focus:border-red-500 focus:ring-red-500": error,
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
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
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