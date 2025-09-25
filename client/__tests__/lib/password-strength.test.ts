import { calculatePasswordStrength } from '@/lib/password-strength';

// Mock zxcvbn
jest.mock('@zxcvbn-ts/core', () => ({
  zxcvbn: jest.fn(),
  zxcvbnOptions: {
    setOptions: jest.fn(),
  },
}));

const { zxcvbn } = require('@zxcvbn-ts/core');

describe('calculatePasswordStrength', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles empty password', () => {
    const result = calculatePasswordStrength('');
    
    expect(result).toEqual({
      strength: 'weak',
      score: 0,
      feedback: ['Enter a password'],
      crackTimeDisplay: 'instantly',
      isValid: false,
    });
  });

  it('calculates weak password strength', () => {
    zxcvbn.mockReturnValue({
      score: 0,
      feedback: {
        warning: 'This is a common password',
        suggestions: ['Add more words', 'Avoid common patterns'],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: 'instantly',
      },
    });

    const result = calculatePasswordStrength('password');
    
    expect(result.strength).toBe('weak');
    expect(result.score).toBe(1); // max(1, 0 + 1) = 1
    expect(result.isValid).toBe(false);
  });

  it('calculates okay password strength', () => {
    zxcvbn.mockReturnValue({
      score: 2,
      feedback: {
        warning: '',
        suggestions: ['Add more characters'],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: '3 hours',
      },
    });

    const result = calculatePasswordStrength('password123');
    
    expect(result.strength).toBe('okay');
    expect(result.score).toBe(4); // 2 + 2
    expect(result.isValid).toBe(true);
  });

  it('calculates strong password strength', () => {
    zxcvbn.mockReturnValue({
      score: 4,
      feedback: {
        warning: '',
        suggestions: [],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: 'centuries',
      },
    });

    const result = calculatePasswordStrength('MyVeryStrongP@ssw0rd!2024');
    
    expect(result.strength).toBe('strong');
    expect(result.score).toBe(6); // 4 + 2, capped at 6
    expect(result.isValid).toBe(true);
  });

  it('handles score of 3 correctly', () => {
    zxcvbn.mockReturnValue({
      score: 3,
      feedback: {
        warning: '',
        suggestions: [],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: '2 days',
      },
    });

    const result = calculatePasswordStrength('GoodPassword123');
    
    expect(result.strength).toBe('strong');
    expect(result.score).toBe(5); // 3 + 2
    expect(result.isValid).toBe(true);
  });

  it('caps score at 6', () => {
    zxcvbn.mockReturnValue({
      score: 4,
      feedback: {
        warning: '',
        suggestions: [],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: 'centuries',
      },
    });

    const result = calculatePasswordStrength('ExtremelyStrongPassword!@#$%^&*()123456');
    
    expect(result.score).toBe(6);
    expect(result.strength).toBe('strong');
  });

  it('processes feedback correctly', () => {
    zxcvbn.mockReturnValue({
      score: 1,
      feedback: {
        warning: 'This is a common password',
        suggestions: ['Add more words', 'Avoid sequences'],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: '2 minutes',
      },
    });

    const result = calculatePasswordStrength('123456');
    
    expect(result.feedback).toContain('This is a common password');
    expect(result.feedback).toContain('Add more words');
    expect(result.feedback).toContain('Avoid sequences');
  });

  it('handles feedback with empty warning', () => {
    zxcvbn.mockReturnValue({
      score: 2,
      feedback: {
        warning: '',
        suggestions: ['Add symbols'],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: '1 hour',
      },
    });

    const result = calculatePasswordStrength('mypassword');
    
    expect(result.feedback).toEqual(['Add symbols']);
  });

  it('handles feedback with empty suggestions', () => {
    zxcvbn.mockReturnValue({
      score: 3,
      feedback: {
        warning: 'Avoid common patterns',
        suggestions: [],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: '3 days',
      },
    });

    const result = calculatePasswordStrength('SomePassword');
    
    expect(result.feedback).toEqual(['Avoid common patterns']);
  });

  it('handles both warning and suggestions', () => {
    zxcvbn.mockReturnValue({
      score: 1,
      feedback: {
        warning: 'This is too common',
        suggestions: ['Use a longer password', 'Add symbols'],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: '5 minutes',
      },
    });

    const result = calculatePasswordStrength('password');
    
    expect(result.feedback).toHaveLength(3);
    expect(result.feedback).toContain('This is too common');
    expect(result.feedback).toContain('Use a longer password');
    expect(result.feedback).toContain('Add symbols');
  });

  it('returns correct crack time display', () => {
    zxcvbn.mockReturnValue({
      score: 2,
      feedback: {
        warning: '',
        suggestions: [],
      },
      crackTimesDisplay: {
        offlineSlowHashing1e4PerSecond: '4 days',
      },
    });

    const result = calculatePasswordStrength('somepassword');
    
    expect(result.crackTimeDisplay).toBe('4 days');
  });

  it('determines validity correctly for different scores', () => {
    // Test weak password (invalid)
    zxcvbn.mockReturnValue({
      score: 1,
      feedback: { warning: '', suggestions: [] },
      crackTimesDisplay: { offlineSlowHashing1e4PerSecond: 'instantly' },
    });

    let result = calculatePasswordStrength('weak');
    expect(result.isValid).toBe(false);

    // Test okay password (valid)
    zxcvbn.mockReturnValue({
      score: 2,
      feedback: { warning: '', suggestions: [] },
      crackTimesDisplay: { offlineSlowHashing1e4PerSecond: '1 hour' },
    });

    result = calculatePasswordStrength('okaypassword');
    expect(result.isValid).toBe(true);

    // Test strong password (valid)
    zxcvbn.mockReturnValue({
      score: 4,
      feedback: { warning: '', suggestions: [] },
      crackTimesDisplay: { offlineSlowHashing1e4PerSecond: 'centuries' },
    });

    result = calculatePasswordStrength('VeryStrongPassword123!');
    expect(result.isValid).toBe(true);
  });

  it('calls zxcvbn with correct password', () => {
    zxcvbn.mockReturnValue({
      score: 2,
      feedback: { warning: '', suggestions: [] },
      crackTimesDisplay: { offlineSlowHashing1e4PerSecond: '1 hour' },
    });

    const testPassword = 'testpassword123';
    calculatePasswordStrength(testPassword);
    
    expect(zxcvbn).toHaveBeenCalledWith(testPassword);
  });

  it('handles edge case scores', () => {
    // Test score 0
    zxcvbn.mockReturnValue({
      score: 0,
      feedback: { warning: 'Very weak', suggestions: [] },
      crackTimesDisplay: { offlineSlowHashing1e4PerSecond: 'instantly' },
    });

    let result = calculatePasswordStrength('1');
    expect(result.strength).toBe('weak');
    expect(result.score).toBe(1); // max(1, 0 + 1) = 1

    // Test score 1
    zxcvbn.mockReturnValue({
      score: 1,
      feedback: { warning: 'Weak', suggestions: [] },
      crackTimesDisplay: { offlineSlowHashing1e4PerSecond: '1 minute' },
    });

    result = calculatePasswordStrength('12');
    expect(result.strength).toBe('weak');
    expect(result.score).toBe(2); // max(1, 1 + 1) = 2

    // Test maximum score 4
    zxcvbn.mockReturnValue({
      score: 4,
      feedback: { warning: '', suggestions: [] },
      crackTimesDisplay: { offlineSlowHashing1e4PerSecond: 'centuries' },
    });

    result = calculatePasswordStrength('P@ssW0rd!2024VerySecure');
    expect(result.strength).toBe('strong');
    expect(result.score).toBe(6);
  });
});