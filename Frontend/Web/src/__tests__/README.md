# Frontend Tests

This directory contains all tests for the TaskForge frontend application.

## Test Structure

```
__tests__/
├── setup.js                          # Test environment setup
├── services/                         # Service layer tests
│   ├── project.service.test.js      # Project API tests
│   ├── task.service.test.js         # Task API tests
│   ├── user.service.test.js         # User API tests
│   └── connection.service.test.js   # Connection monitoring tests
├── utils/                            # Utility tests
│   └── api.test.js                  # API configuration tests
└── integration/                      # Integration tests
    └── project-task.test.js         # Cross-feature integration tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

### Run specific test file
```bash
npm test -- project.service.test.js
```

### Run tests in CI mode
```bash
npm run test:ci
```

## Test Categories

### Service Tests
Tests for API service classes that interact with backend endpoints:
- **ProjectService**: CRUD operations for projects
- **TaskService**: Task management and updates
- **UserService**: User profiles and authentication
- **ConnectionService**: Backend connectivity checks

### Integration Tests
Tests that verify multiple components work together:
- Project and Task integration
- User authentication flow
- Data consistency across features

### Utility Tests
Tests for helper functions and configurations:
- API configuration
- Token handling
- Error handling

## Writing Tests

### Basic Test Structure
```javascript
import { describe, test, expect, jest, beforeEach } from '@jest/globals'
import ServiceName from '../../services/service.name'
import api from '../../lib/api'

jest.mock('../../lib/api')

describe('ServiceName', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  test('should perform operation successfully', async () => {
    const mockData = { id: 1, name: 'Test' }
    api.get.mockResolvedValue({ data: mockData })

    const result = await ServiceName.getItem(1)

    expect(api.get).toHaveBeenCalledWith('/endpoint/1')
    expect(result).toEqual(mockData)
  })
})
```

### Mocking API Calls
```javascript
// Mock successful response
api.get.mockResolvedValue({ data: mockData })

// Mock error response
api.get.mockRejectedValue({ 
  response: { data: { message: 'Error' } } 
})
```

## Test Coverage Goals

- **Services**: 80%+ coverage
- **Integration**: Key user flows covered
- **Overall**: 70%+ coverage

## Current Test Status

### Service Tests (49 tests)
- ✅ ProjectService: 8 tests
- ✅ TaskService: 11 tests  
- ✅ UserService: 9 tests
- ✅ ConnectionService: 4 tests

### Integration Tests (4 tests)
- ✅ Project-Task integration: 4 tests

### Utility Tests (3 tests)
- ✅ API configuration: 3 tests

**Total: 56 tests**

## Continuous Integration

Tests are automatically run on:
- Pre-commit hooks
- Pull requests
- CI/CD pipeline

## Debugging Tests

### Run tests with verbose output
```bash
npm test -- --verbose
```

### Run single test
```bash
npm test -- -t "test name pattern"
```

### Debug in VS Code
Add breakpoint and use Jest Debug configuration

## Best Practices

1. **Isolate tests**: Each test should be independent
2. **Mock external dependencies**: Always mock API calls
3. **Clear mocks**: Use `beforeEach` to reset mocks
4. **Descriptive names**: Test names should explain what they test
5. **Test edge cases**: Include error scenarios
6. **Keep tests simple**: One assertion per test when possible

## Dependencies

- **Jest**: Test runner and framework
- **@testing-library/jest-dom**: Custom matchers
- **babel-jest**: Transform JSX and ES modules

## Troubleshooting

### Import errors
Make sure `@/` alias is configured in `jest.config.js`

### Module not found
Check `moduleNameMapper` in jest config

### Timeout errors
Increase `testTimeout` in jest config for slow tests

### Mock not working
Ensure mock is declared before importing the tested module
