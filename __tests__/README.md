# Testing Documentation

## Overview
This project uses Jest as the testing framework for comprehensive unit testing of all services and utilities.

## Test Structure
```
__tests__/
├── services/           # Service layer tests
│   └── messageStore.test.js
├── README.md          # This file
└── jest.config.js     # Jest configuration
```

## Running Tests

### Basic Test Run
```bash
npm test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Coverage

### MessageStore Service: 100% Coverage ✅
- **Statements**: 100%
- **Branches**: 100%
- **Functions**: 100%
- **Lines**: 100%

#### Test Categories:
1. **Constructor Tests** - Initialization verification
2. **Message Storage** - Core storage functionality
3. **Message Retrieval** - Getting and querying messages
4. **Project Management** - Project-level operations
5. **Data Integrity** - Copy protection and data isolation
6. **Edge Cases** - Error handling and boundary conditions
7. **Integration Scenarios** - End-to-end workflows

#### Key Test Features:
- **Mocking**: Logger dependencies are mocked to avoid console noise
- **Isolation**: Each test gets a fresh MessageStore instance
- **Comprehensive**: Tests cover all public methods and edge cases
- **Realistic**: Tests use realistic Slack message structures
- **Maintainable**: Clear test descriptions and organized test groups

## Test Configuration

### Jest Setup (`jest.config.js`)
- Node.js test environment
- Coverage collection from `src/` directory
- Test file pattern matching
- Module name mapping for clean imports

### Test Setup (`jest.setup.js`)
- Global test utilities
- Mock Slack message helpers
- Test timeout configuration
- Console output control

## Adding New Tests

### For New Services:
1. Create test file in appropriate `__tests__/` subdirectory
2. Follow naming convention: `serviceName.test.js`
3. Mock external dependencies
4. Test all public methods
5. Include edge cases and error scenarios
6. Aim for 100% coverage

### Test Structure Template:
```javascript
const ServiceClass = require('../../src/services/serviceName');

// Mock dependencies
jest.mock('../../src/utils/logger', () => ({
  // Mock methods
}));

describe('ServiceClass', () => {
  let service;

  beforeEach(() => {
    service = new ServiceClass();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Method Name', () => {
    test('should do something specific', () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

## Best Practices

1. **Test Isolation**: Each test should be independent
2. **Clear Naming**: Test descriptions should explain the expected behavior
3. **Mock External Dependencies**: Don't test third-party code
4. **Cover Edge Cases**: Test error conditions and boundary values
5. **Maintain Coverage**: Keep test coverage above 90%
6. **Fast Execution**: Tests should run quickly (< 1 second total)

## Future Test Plans

- [ ] SlackBot service tests
- [ ] Summarizer service tests  
- [ ] SummaryScheduler cron tests
- [ ] Utility function tests
- [ ] Integration tests
- [ ] End-to-end tests
