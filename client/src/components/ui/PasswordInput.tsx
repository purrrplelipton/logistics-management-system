'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import { Icon } from '@iconify-icon/react';
import { Input, InputProps } from './Input';
import { cn } from '@/lib/utils';
import { calculatePasswordStrength, PasswordStrength, PasswordStrengthInfo } from '@/lib/password-strength';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'endElement'> {
  showStrengthIndicator?: boolean;
  showToggle?: boolean;
  strengthInfo?: PasswordStrengthInfo;
  onStrengthChange?: (info: PasswordStrengthInfo) => void;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    showStrengthIndicator = false,
    showToggle = true,
    strengthInfo: externalStrengthInfo,
    onStrengthChange,
    value = '',
    onChange,
    startElement = <Icon icon="solar:lock-password-outline" className="text-xl" />,
    className,
    disabled,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalStrengthInfo, setInternalStrengthInfo] = useState<PasswordStrengthInfo>(
      calculatePasswordStrength(String(value))
    );

    const strengthInfo = externalStrengthInfo || internalStrengthInfo;

    useEffect(() => {
      if (showStrengthIndicator && !externalStrengthInfo) {
        const newStrengthInfo = calculatePasswordStrength(String(value));
        setInternalStrengthInfo(newStrengthInfo);
        onStrengthChange?.(newStrengthInfo);
      }
    }, [value, showStrengthIndicator, externalStrengthInfo, onStrengthChange]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange?.(e);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const getStrengthColor = (strength: PasswordStrength) => {
      switch (strength) {
        case 'weak': return 'bg-red-500';
        case 'okay': return 'bg-yellow-500';
        case 'strong': return 'bg-green-500';
        default: return 'bg-gray-300';
      }
    };

    const getStrengthTextColor = (strength: PasswordStrength) => {
      switch (strength) {
        case 'weak': return 'text-red-600';
        case 'okay': return 'text-yellow-600';
        case 'strong': return 'text-green-600';
        default: return 'text-gray-500';
      }
    };

    const getActiveStrengthSegments = (info: PasswordStrengthInfo) => {
      switch (info.strength) {
        case 'strong':
          return 3;
        case 'okay':
          return 2;
        case 'weak':
        default:
          return info.score > 0 ? 1 : 0;
      }
    };

    const activeSegments = getActiveStrengthSegments(strengthInfo);

    const endElement = showToggle ? (
      <button
        type="button"
        className={cn(
          "p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors grid place-items-center",
          disabled && "cursor-not-allowed opacity-50 hover:text-gray-400 focus:text-gray-400"
        )}
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
        disabled={disabled}
      >
        <Icon 
          icon={showPassword ? "solar:eye-closed-outline" : "solar:eye-outline"}
          className="text-base" 
        />
      </button>
    ) : undefined;

    return (
      <div className="w-full space-y-2">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={handleChange}
          startElement={startElement}
          endElement={endElement}
          className={cn(className)}
          disabled={disabled}
          {...props}
        />
        
        {showStrengthIndicator && String(value) && (
          <div className="space-y-2">
            {/* Strength bar */}
            <div className="flex space-x-1">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-200",
                    i < activeSegments
                      ? getStrengthColor(strengthInfo.strength)
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            
            {/* Strength label only */}
            <div className="flex justify-center">
              <span className={cn("text-xs font-medium capitalize", getStrengthTextColor(strengthInfo.strength))}>
                {strengthInfo.strength} password
              </span>
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };