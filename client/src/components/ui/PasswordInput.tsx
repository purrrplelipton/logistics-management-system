'use client';

import React, { useState, forwardRef, ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, InputProps } from './Input';
import { cn } from '@/lib/utils';

export type PasswordStrength = 'weak' | 'okay' | 'strong';

export interface PasswordStrengthInfo {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
}

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'endElement'> {
  showStrengthIndicator?: boolean;
  showToggle?: boolean;
  strengthInfo?: PasswordStrengthInfo;
  onStrengthChange?: (info: PasswordStrengthInfo) => void;
}

const calculatePasswordStrength = (password: string): PasswordStrengthInfo => {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: ['Enter a password']
    };
  }

  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 2;
  } else if (password.length >= 6) {
    score += 1;
    feedback.push('Use at least 8 characters');
  } else {
    feedback.push('Use at least 8 characters');
  }

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('Add lowercase letters');

  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('Add uppercase letters');

  if (/\d/.test(password)) score += 1;
  else feedback.push('Add numbers');

  if (/[^a-zA-Z\d]/.test(password)) score += 1;
  else feedback.push('Add special characters');

  // Common patterns penalty
  if (/(.)\1{2,}/.test(password)) {
    score -= 1;
    feedback.push('Avoid repeated characters');
  }

  if (/123|abc|password|qwerty/i.test(password)) {
    score -= 2;
    feedback.push('Avoid common patterns');
  }

  // Determine strength
  let strength: PasswordStrength;
  if (score >= 5) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'okay';
  } else {
    strength = 'weak';
  }

  if (strength === 'strong' && feedback.length === 0) {
    feedback.push('Strong password!');
  }

  return { strength, score: Math.max(0, Math.min(6, score)), feedback };
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ 
    showStrengthIndicator = false,
    showToggle = true,
    strengthInfo: externalStrengthInfo,
    onStrengthChange,
    value = '',
    onChange,
    startIcon = <Lock />,
    className,
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalStrengthInfo, setInternalStrengthInfo] = useState<PasswordStrengthInfo>(
      calculatePasswordStrength(String(value))
    );

    const strengthInfo = externalStrengthInfo || internalStrengthInfo;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      
      if (showStrengthIndicator && !externalStrengthInfo) {
        const newStrengthInfo = calculatePasswordStrength(newValue);
        setInternalStrengthInfo(newStrengthInfo);
        onStrengthChange?.(newStrengthInfo);
      }
      
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
        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
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
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors duration-200",
                    i < strengthInfo.score
                      ? getStrengthColor(strengthInfo.strength)
                      : "bg-gray-200"
                  )}
                />
              ))}
            </div>
            
            {/* Strength label */}
            <div className="flex justify-between items-center">
              <span className={cn("text-xs font-medium capitalize", getStrengthTextColor(strengthInfo.strength))}>
                {strengthInfo.strength} password
              </span>
              <span className="text-xs text-gray-500">
                {strengthInfo.score}/6
              </span>
            </div>
            
            {/* Feedback */}
            {strengthInfo.feedback.length > 0 && (
              <div className="text-xs text-gray-600 space-y-1">
                {strengthInfo.feedback.slice(0, 3).map((feedback, i) => (
                  <div key={i} className="flex items-center space-x-1">
                    <span className={cn(
                      "w-1 h-1 rounded-full",
                      feedback === 'Strong password!' ? 'bg-green-500' : 'bg-gray-400'
                    )} />
                    <span>{feedback}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };