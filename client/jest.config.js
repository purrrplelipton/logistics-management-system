const nextJest = require("next/jest");

/** @type {import('jest').Config} */
const createJestConfig = nextJest({
  dir: "./",
});

const esModules = [
  "until-async",
  "msw",
  "@mswjs",
  "@bundled-es-modules",
  "@iconify-icons",
  "@iconify",
];

const config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFiles: ["<rootDir>/jest.polyfills.js"],
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@iconify-icons/(.*)$": "<rootDir>/__mocks__/iconify-icon-stub.ts",
    "^until-async$": "<rootDir>/__mocks__/until-async.ts",
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/",
    "<rootDir>/node_modules/",
    "<rootDir>/__tests__/mocks/",
  ],
  transformIgnorePatterns: [
    `node_modules/(?!((?:\\.pnpm/)?(?:${esModules.join("|")})(?:@|/|\\+)))`,
  ],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/app/layout.tsx",
    "!src/app/globals.css",
  ],
};

module.exports = createJestConfig(config);
