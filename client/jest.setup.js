import "@testing-library/jest-dom";
// import { server } from "./__tests__/mocks/server";

// Establish API mocking before all tests
// beforeAll(() => {
//   server.listen({ onUnhandledRequest: "error" });
// });

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
// afterEach(() => {
//   server.resetHandlers();
// });

// Clean up after the tests are finished
// afterAll(() => {
//   server.close();
// });

// Mock Next.js router
jest.mock("next/navigation", () => ({
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
  usePathname: () => "/",
}));

// Mock Next.js cookies
jest.mock("next/headers", () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
}));

// Mock @iconify/react
jest.mock("@iconify/react", () => ({
  Icon: ({ icon, className, ...props }) => (
    <span
      data-testid={`icon-${icon?.name || icon || "unknown"}`}
      className={className}
      {...props}
    />
  ),
}));

// Mock iconify icon imports
jest.mock("@iconify-icons/solar/close-circle-bold", () => ({
  __esModule: true,
  default: {
    name: "close-circle-bold",
    body: '<path d="close-icon"/>',
  },
}));

jest.mock("@iconify-icons/solar/eye-outline", () => ({
  __esModule: true,
  default: {
    name: "eye-outline",
    body: '<path d="eye-icon"/>',
  },
}));

jest.mock("@iconify-icons/solar/eye-closed-outline", () => ({
  __esModule: true,
  default: {
    name: "eye-closed-outline",
    body: '<path d="eye-closed-icon"/>',
  },
}));

jest.mock("@iconify-icons/solar/lock-password-outline", () => ({
  __esModule: true,
  default: {
    name: "lock-password-outline",
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
Object.defineProperty(window, "matchMedia", {
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
