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
  (
    {
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
    },
    ref,
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const errorId = error ? `${inputId}-error` : undefined;
    const finalAriaDescribedBy = [ariaDescribedBy, errorId].filter(Boolean).join(' ') || undefined;

    return (
      <div className={cn('w-full', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn('mb-1 block text-sm font-medium text-gray-700', labelClassName)}
          >
            {label}{' '}
            {required && (
              <span className="text-red-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <div
          className={cn(
            'flex items-center rounded-md border text-gray-900 transition-colors focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500',
            {
              'border-red-300 focus-within:border-red-500 focus-within:ring-red-500': error,
              'border-gray-300': !error,
            },
          )}
        >
          {startElement && (
            <div className="text-current/50 flex flex-shrink-0 items-center pl-3">
              {startElement}
            </div>
          )}

          <input
            type={type}
            className={cn(
              'min-w-0 flex-1 px-3 py-2 outline-none sm:text-sm',
              {
                'text-red-900 placeholder-red-300': error,
              },
              className,
            )}
            ref={ref}
            id={inputId}
            required={required}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={finalAriaDescribedBy}
            {...props}
          />

          {endElement && (
            <div className="text-current/50 flex flex-shrink-0 items-center pr-3">{endElement}</div>
          )}
        </div>

        {error && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-600" aria-live="polite">
            {error}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
