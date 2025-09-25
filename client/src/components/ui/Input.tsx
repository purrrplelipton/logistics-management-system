'use client';

import React, { forwardRef, ReactNode, useId } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
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
    const generatedId = useId();
    const inputId = id || generatedId;
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
          "flex items-center border rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-colors text-gray-900",
          {
            "border-red-300 focus-within:border-red-500 focus-within:ring-red-500": error,
            "border-gray-300": !error
          }
        )}>
          {startElement && (
            <div className="flex items-center pl-3 flex-shrink-0 text-current/50">
              {startElement}
            </div>
          )}
          
          <input
            type={type}
            className={cn(
              "flex-1 min-w-0 py-2 px-3 outline-none sm:text-sm",
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
          
          {endElement && (
            <div className="flex items-center pr-3 flex-shrink-0 text-current/50">
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