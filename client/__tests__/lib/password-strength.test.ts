import { calculatePasswordStrength } from '@/lib/password-strength';

import zxcvbn, { ZXCVBNResult } from 'zxcvbn';

jest.mock('zxcvbn');

const mockedZxcvbn = zxcvbn as jest.MockedFunction<typeof zxcvbn>;

const mockResult = (overrides: Partial<ZXCVBNResult>): ZXCVBNResult => ({
  calc_time: 0,
  crack_times_seconds: {
    online_throttling_100_per_hour: 0,
    online_no_throttling_10_per_second: 0,
    offline_slow_hashing_1e4_per_second: 0,
    offline_fast_hashing_1e10_per_second: 0,
  },
  crack_times_display: {
    online_throttling_100_per_hour: 'instant',
    online_no_throttling_10_per_second: 'instant',
    offline_slow_hashing_1e4_per_second: 'instant',
    offline_fast_hashing_1e10_per_second: 'instant',
  },
  feedback: {
    warning: '',
    suggestions: [],
  },
  guesses: 1,
  guesses_log10: 0,
  password: '',
  score: 0,
  sequence: [],
  ...overrides,
});

describe('calculatePasswordStrength', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns default values when password is empty', () => {
    const result = calculatePasswordStrength('');

    expect(result).toEqual({
      strength: 'weak',
      score: 0,
      feedback: ['Enter a password'],
      crackTimeDisplay: 'instant',
      isValid: false,
    });
  });

  it('classifies score 0 and 1 as weak', () => {
    mockedZxcvbn
      .mockReturnValueOnce(mockResult({ score: 0, feedback: { warning: 'Too common', suggestions: ['Add more words'] } }))
      .mockReturnValueOnce(mockResult({ score: 1 }));

    let result = calculatePasswordStrength('password');
    expect(result.strength).toBe('weak');
    expect(result.isValid).toBe(false);
    expect(result.feedback).toEqual(['Too common', 'Add more words']);

    result = calculatePasswordStrength('better');
    expect(result.strength).toBe('weak');
    expect(result.isValid).toBe(false);
  });

  it('classifies scores 2 and 3 as okay', () => {
    mockedZxcvbn
      .mockReturnValueOnce(mockResult({ score: 2, feedback: { warning: '', suggestions: ['Add symbols'] }, crack_times_display: { offline_slow_hashing_1e4_per_second: '3 hours' } }))
      .mockReturnValueOnce(mockResult({ score: 3 }));

    let result = calculatePasswordStrength('password123');
    expect(result.strength).toBe('okay');
    expect(result.isValid).toBe(true);
    expect(result.score).toBe(2);
    expect(result.crackTimeDisplay).toBe('3 hours');
    expect(result.feedback).toEqual(['Add symbols']);

    result = calculatePasswordStrength('BetterPassword123');
    expect(result.strength).toBe('okay');
    expect(result.isValid).toBe(true);
    expect(result.score).toBe(3);
  });

  it('classifies score 4 as strong and returns celebratory feedback when none provided', () => {
    mockedZxcvbn.mockReturnValue(mockResult({ score: 4, feedback: { warning: '', suggestions: [] }, crack_times_display: { offline_slow_hashing_1e4_per_second: 'centuries', online_throttling_100_per_hour: '1 year', online_no_throttling_10_per_second: '1 year', offline_fast_hashing_1e10_per_second: 'centuries' } }));

    const result = calculatePasswordStrength('MyVeryStrongP@ssw0rd!2024');

    expect(result.strength).toBe('strong');
    expect(result.isValid).toBe(true);
    expect(result.score).toBe(4);
    expect(result.feedback).toEqual(['Excellent password strength!']);
    expect(result.crackTimeDisplay).toBe('centuries');
  });

  it('passes user inputs through to zxcvbn', () => {
    mockedZxcvbn.mockReturnValue(mockResult({ score: 2 }));

    const password = 'Password123';
    const userInputs = ['email@example.com'];

    calculatePasswordStrength(password, userInputs);

    expect(mockedZxcvbn).toHaveBeenCalledWith(password, userInputs);
  });
});