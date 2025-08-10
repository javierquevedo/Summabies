// Jest setup file
// This file runs before each test

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  // Uncomment to suppress console.log in tests
  // log: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Set test timeout
jest.setTimeout(10000);

// Global test utilities
global.testUtils = {
  // Helper to create mock Slack messages
  createMockSlackMessage: (project, user, text, ts = Date.now() / 1000) => ({
    user,
    text: project ? `[${project}] ${text}` : text,
    ts: ts.toString(),
    team: 'T1234567890',
    channel: 'C1234567890',
    type: 'message'
  }),
  
  // Helper to create mock project messages
  createMockProjectMessage: (project, user, text, ts = Date.now() / 1000) => ({
    user,
    text,
    ts: ts.toString()
  })
};
