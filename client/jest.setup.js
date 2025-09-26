import '@testing-library/jest-dom';
import { ReadableStream, TransformStream, WritableStream } from 'stream/web';
// Establish API mocking before all tests
beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
  server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => {
  server.close();
});

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => '/',
}));

// Mock Next.js cookies
jest.mock('next/headers', () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Mock @iconify-icon/react
jest.mock('@iconify-icon/react', () => ({
  Icon: ({ icon, className, ...props }) => (
    <span
      data-testid={`icon-${icon?.name || icon || 'unknown'}`}
      className={className}
      {...props}
    />
  ),
}));

// Mock iconify icon imports
jest.mock('@iconify-icons/solar/close-circle-bold', () => ({
  __esModule: true,
  default: {
    name: 'close-circle-bold',
    body: '<path d="close-icon"/>',
  },
}));

jest.mock('@iconify-icons/solar/eye-outline', () => ({
  __esModule: true,
  default: {
    name: 'eye-outline',
    body: '<path d="eye-icon"/>',
  },
}));

jest.mock('@iconify-icons/solar/eye-closed-outline', () => ({
  __esModule: true,
  default: {
    name: 'eye-closed-outline',
    body: '<path d="eye-closed-icon"/>',
  },
}));

jest.mock('@iconify-icons/solar/lock-password-outline', () => ({
  __esModule: true,
  default: {
    name: 'lock-password-outline',
    body: '<path d="lock-icon"/>',
  },
}));

// Global test utilities
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

if (typeof global.TransformStream === 'undefined') {
  // @ts-expect-error - assigning to global in test environment
  global.TransformStream = TransformStream;
}

if (typeof global.ReadableStream === 'undefined') {
  // @ts-expect-error - assigning to global in test environment
  global.ReadableStream = ReadableStream;
}

if (typeof global.WritableStream === 'undefined') {
  // @ts-expect-error - assigning to global in test environment
  global.WritableStream = WritableStream;
}

// Defer requiring the MSW server until after polyfills are in place
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { server } = require('./__tests__/mocks/server');
