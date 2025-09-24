'use client';

import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';

// Configure zxcvbn with English language support
const options = {
  translations: zxcvbnEnPackage.translations,
  graphs: zxcvbnCommonPackage.adjacencyGraphs,
  dictionary: {
    ...zxcvbnCommonPackage.dictionary,
    ...zxcvbnEnPackage.dictionary,
  },
};

zxcvbnOptions.setOptions(options);

export type PasswordStrength = 'weak' | 'okay' | 'strong';

export interface PasswordStrengthInfo {
  strength: PasswordStrength;
  score: number;
  feedback: string[];
  crackTimeDisplay: string;
  isValid: boolean; // For registration validation
}

export const calculatePasswordStrength = (password: string): PasswordStrengthInfo => {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: ['Enter a password'],
      crackTimeDisplay: 'instantly',
      isValid: false
    };
  }

  const result = zxcvbn(password);
  
  // Convert zxcvbn score (0-4) to our score (0-6) and strength
  let strength: PasswordStrength;
  let normalizedScore: number;
  
  if (result.score >= 3) {
    strength = 'strong';
    normalizedScore = Math.min(6, result.score + 2); // 5-6 range
  } else if (result.score >= 2) {
    strength = 'okay';
    normalizedScore = result.score + 2; // 4 range
  } else {
    strength = 'weak';
    normalizedScore = Math.max(1, result.score + 1); // 1-2 range
  }

  // Format feedback messages
  const feedback: string[] = [];
  
  if (result.feedback.warning) {
    feedback.push(result.feedback.warning);
  }
  
  if (result.feedback.suggestions.length > 0) {
    feedback.push(...result.feedback.suggestions.slice(0, 2)); // Limit to 2 suggestions
  }
  
  if (feedback.length === 0 && strength === 'strong') {
    feedback.push('Excellent password strength!');
  }

  return {
    strength,
    score: normalizedScore,
    feedback,
    crackTimeDisplay: result.crackTimesDisplay.offlineSlowHashing1e4PerSecond,
    isValid: strength !== 'weak' // Passwords must be at least 'okay' or 'strong'
  };
};