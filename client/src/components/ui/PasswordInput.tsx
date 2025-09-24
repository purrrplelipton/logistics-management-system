'use client';

import React, { useState, forwardRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
import eyeIcon from '@iconify-icons/solar/eye-outline';
import eyeClosedIcon from '@iconify-icons/solar/eye-closed-outline';
import lockIcon from '@iconify-icons/solar/lock-password-outline';
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
    startIcon = <Icon icon={lockIcon} className="w-5 h-5" />,
    className,
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

    const endElement = showToggle ? (
      <button
        type="button"
        className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
        onClick={togglePasswordVisibility}
        aria-label={showPassword ? 'Hide password' : 'Show password'}
        tabIndex={-1}
      >
        <Icon 
          icon={showPassword ? eyeClosedIcon : eyeIcon} 
          className="w-4 h-4" 
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
          startIcon={startIcon}
          endElement={endElement}
          className={cn(className)}
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
                    i < Math.ceil(strengthInfo.score / 2)
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