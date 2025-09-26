'use client';

import zxcvbn, { ZXCVBNScore } from 'zxcvbn';

export type PasswordStrength = 'weak' | 'okay' | 'strong';

export interface PasswordStrengthInfo {
  strength: PasswordStrength;
  score: ZXCVBNScore;
  feedback: string[];
  crackTimeDisplay: string;
  isValid: boolean;
}

const mapScoreToStrength = (score: ZXCVBNScore): PasswordStrength => {
  if (score >= 4) {
    return 'strong';
  }

  if (score >= 2) {
    return 'okay';
  }

  return 'weak';
};

const buildFeedback = (score: ZXCVBNScore, warning?: string, suggestions: string[] = []): string[] => {
  const messages = [warning, ...suggestions].filter((message): message is string => Boolean(message && message.trim()));

  if (messages.length === 0 && score >= 4) {
    return ['Excellent password strength!'];
  }

  return messages;
};

export const calculatePasswordStrength = (password: string, userInputs: string[] = []): PasswordStrengthInfo => {
  if (!password) {
    return {
      strength: 'weak',
      score: 0,
      feedback: ['Enter a password'],
      crackTimeDisplay: 'instant',
      isValid: false,
    };
  }

  const result = zxcvbn(password, userInputs);
  const strength = mapScoreToStrength(result.score);

  return {
    strength,
    score: result.score,
    feedback: buildFeedback(result.score, result.feedback.warning, result.feedback.suggestions),
    crackTimeDisplay: String(result.crack_times_display.offline_slow_hashing_1e4_per_second),
    isValid: result.score >= 2,
  };
};