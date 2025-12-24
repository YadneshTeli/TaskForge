# Testing Infrastructure

## Overview
This directory contains automated tests for the TaskForge backend using Jest.

## Test Structure

```
__tests__/
├── health.test.js          - Health check endpoint tests
├── project.service.test.js - Project service tests
├── services.test.js        - Multiple service tests
├── task.service.test.js    - Task service tests
├── user.service.test.js    - User service tests (with DB integration)
└── utils.test.js           - Utility function tests
```

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode (auto-rerun on file changes)
```bash
npm run test:watch
```

### Run tests with coverage report
```bash
npm run test:coverage
```

## Test Coverage

Current test coverage includes:
- ✅ Service method exports verification
- ✅ Service structure validation
- ✅ Utility function imports
- ✅ Error class functionality
- ✅ User service CRUD operations
- ✅ Health check endpoint structure

## Writing Tests

### Basic Test Structure
```javascript
import { describe, test, expect } from '@jest/globals';
import myService from '../src/services/myService.js';

describe('My Service Tests', () => {
  test('should do something', () => {
    const result = myService.doSomething();
    expect(result).toBe(expectedValue);
  });
});
```

### Database Integration Tests
For tests that require database connectivity:
```javascript
import { beforeAll, afterAll } from '@jest/globals';
import mongoose from 'mongoose';

beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_URI);
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

## Test Configuration

Configuration is defined in `jest.config.json`:
- **testEnvironment**: node
- **testTimeout**: 10000ms (10 seconds)
- **collectCoverageFrom**: All files in src/ except server.js and index.js files
- **coverageDirectory**: coverage/
- **verbose**: true (detailed test output)

## Best Practices

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Cleanup**: Always clean up test data in afterAll/afterEach hooks
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Structure tests with setup, execution, and verification
5. **Mock External Services**: Mock API calls, file system operations, etc.

## Test Categories

### Unit Tests
Test individual functions/methods in isolation
- Located in: `__tests__/*.test.js`
- Focus: Service methods, utility functions

### Integration Tests
Test multiple components working together
- Located in: `__tests__/*.test.js` (with database)
- Focus: Database operations, service interactions

### API Tests
Test REST endpoints (TODO: Add more)
- Located in: `__tests__/health.test.js`
- Focus: HTTP responses, status codes, data structure

## Coverage Goals

Target coverage percentages:
- Statements: 80%+
- Branches: 75%+
- Functions: 80%+
- Lines: 80%+

## Adding New Tests

When adding new features:
1. Create a test file in `__tests__/` directory
2. Follow naming convention: `feature.test.js`
3. Import necessary dependencies
4. Write test cases covering:
   - Happy path (expected behavior)
   - Edge cases
   - Error conditions
5. Run tests to verify they pass
6. Check coverage to ensure adequate testing

## CI/CD Integration

Tests can be integrated into CI/CD pipelines:
```yaml
# Example GitHub Actions workflow
- name: Run tests
  run: npm test
  
- name: Check coverage
  run: npm run test:coverage
```

## Troubleshooting

### Tests hanging or timing out
- Increase timeout in jest.config.json
- Ensure database connections are properly closed
- Check for unresolved promises

### Module import errors
- Verify file paths use .js extension
- Check that module exists and is exported correctly
- Ensure jest.config.json moduleNameMapper is configured

### Database connection errors
- Verify MONGODB_URI environment variable is set
- Ensure MongoDB is running
- Check database connection string format

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
