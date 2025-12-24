# Error Handling Documentation

## Overview

TaskForge backend implements comprehensive end-to-end error handling across all layers of the application including:
- Custom error classes for specific error types
- Enhanced error handler middleware
- GraphQL error formatting
- Service layer error handling
- Process-level error handlers
- Graceful shutdown handling

## Custom Error Classes

Located in `src/utils/errors.js`, these provide specific error types for better error handling:

### Available Error Classes

1. **AppError** (Base class)
   - Status Code: 500 (default)
   - Base class for all custom errors

2. **AuthenticationError**
   - Status Code: 401
   - Used for: Failed login, invalid/expired tokens

3. **AuthorizationError**
   - Status Code: 403
   - Used for: Insufficient permissions

4. **NotFoundError**
   - Status Code: 404
   - Used for: Resource not found

5. **ValidationError**
   - Status Code: 400
   - Used for: Request validation failures

6. **ConflictError**
   - Status Code: 409
   - Used for: Duplicate resources (email, username)

7. **BadRequestError**
   - Status Code: 400
   - Used for: General bad requests

8. **DatabaseError**
   - Status Code: 500
   - Used for: Database operation failures

9. **ExternalServiceError**
   - Status Code: 502
   - Used for: External API failures

10. **RateLimitError**
    - Status Code: 429
    - Used for: Rate limit exceeded

11. **FileUploadError**
    - Status Code: 400
    - Used for: File upload failures

12. **TokenError**
    - Status Code: 401
    - Used for: JWT-specific errors

### Usage Example

```javascript
import { NotFoundError, ValidationError } from '../utils/errors.js';

// In a service
async getProjectById(projectId) {
    const project = await Project.findById(projectId);
    if (!project) {
        throw new NotFoundError('Project', projectId);
    }
    return project;
}

// In a controller
if (!email || !password) {
    throw new ValidationError('Email and password are required');
}
```

## Error Handler Middleware

Enhanced error handler in `src/middleware/errorHandler.js` handles:

### Handled Error Types

1. **Mongoose Validation Errors**
   - Converts to 400 with field-specific error messages

2. **Mongoose Duplicate Key Errors**
   - Converts to 409 with friendly message

3. **Mongoose Cast Errors**
   - Converts to 400 for invalid ObjectIds

4. **JWT Errors**
   - JsonWebTokenError → 401
   - TokenExpiredError → 401

5. **Prisma Errors**
   - P2002 (Unique constraint) → 409
   - P2025 (Record not found) → 404
   - Others → 500

6. **Express-Validator Errors**
   - Converts validation result to 400 with field errors

### Error Response Format

#### Development Environment
```json
{
  "status": "fail",
  "message": "Error message",
  "errors": [...],
  "stack": "stack trace",
  "error": {full error object}
}
```

#### Production Environment
```json
{
  "status": "fail",
  "message": "Error message",
  "errors": [...]
}
```

## GraphQL Error Handling

Located in `src/server.js`, Apollo Server configuration includes:

### formatError Function
- Logs all GraphQL errors
- Hides internal server errors in production
- Maintains error codes and extensions

### Custom Error Mapping
- AuthenticationError → BAD_USER_INPUT (401)
- NotFoundError → NOT_FOUND (404)
- ValidationError → BAD_USER_INPUT (400)

## Service Layer Error Handling

All services implement try-catch blocks and throw appropriate custom errors:

### Pattern
```javascript
async createResource(data) {
    try {
        const resource = await Model.create(data);
        return resource;
    } catch (error) {
        if (error.name === 'ValidationError') {
            throw new ValidationError('Validation failed', error.errors);
        }
        throw new DatabaseError('Failed to create resource', error);
    }
}
```

## Process-Level Error Handlers

Located in `src/server.js`:

### Uncaught Exception Handler
```javascript
process.on('uncaughtException', (error) => {
    // Logs error and exits process
});
```

### Unhandled Rejection Handler
```javascript
process.on('unhandledRejection', (reason, promise) => {
    // Logs error, exits in production
});
```

### Graceful Shutdown Handlers
```javascript
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
```

Graceful shutdown:
1. Stops accepting new connections
2. Closes HTTP server
3. Closes MongoDB connection
4. Closes Prisma connection
5. Exits process

## Middleware Order

Critical middleware order in `server.js`:

```javascript
// 1. Security middleware (helmet, CORS, rate limiting)
app.use(securityMiddleware);

// 2. Body parsers
app.use(express.json());

// 3. Authentication (decode token)
app.use(decodeToken);

// 4. Routes
app.use('/api/auth', authRoutes);
app.use('/api/project', projectRoutes);
// ... other routes

// 5. 404 handler (MUST be after all routes)
app.use(notFoundHandler);

// 6. Error handler (MUST be last)
app.use(errorHandler);
```

## Best Practices

### 1. Always Use Async Handler
```javascript
import asyncHandler from '../utils/asyncHandler.js';

router.get('/resource', asyncHandler(async (req, res) => {
    const data = await someAsyncOperation();
    res.json(data);
}));
```

### 2. Throw Specific Errors
```javascript
// Good
throw new NotFoundError('User', userId);

// Avoid
throw new Error('Not found');
```

### 3. Validate Early
```javascript
// Validate at route level with express-validator
router.post('/create',
    [
        body('email').isEmail(),
        body('password').isLength({ min: 8 })
    ],
    validate, // Validation middleware
    asyncHandler(async (req, res) => {
        // Handler code
    })
);
```

### 4. Handle Service Errors
```javascript
// Services should throw custom errors
async getUserById(id) {
    const user = await User.findById(id);
    if (!user) throw new NotFoundError('User', id);
    return user;
}
```

### 5. Don't Catch in Routes
```javascript
// Good - Let asyncHandler catch errors
router.get('/user/:id', asyncHandler(async (req, res) => {
    const user = await userService.getUserById(req.params.id);
    res.json(user);
}));

// Bad - Don't catch errors in routes
router.get('/user/:id', asyncHandler(async (req, res) => {
    try {
        const user = await userService.getUserById(req.params.id);
        res.json(user);
    } catch (error) {
        // This prevents proper error handling
        res.status(500).json({ error: error.message });
    }
}));
```

## Testing Error Handling

### Test Uncaught Errors
```javascript
// Trigger 404
GET http://localhost:4000/api/nonexistent

// Expected: 404 with proper message
{
  "status": "fail",
  "message": "Route with identifier '/api/nonexistent' not found."
}
```

### Test Validation Errors
```javascript
// Missing required fields
POST http://localhost:4000/api/auth/register
Body: {}

// Expected: 400 with field errors
{
  "status": "fail",
  "message": "Validation failed",
  "errors": [...]
}
```

### Test Authentication Errors
```javascript
// No token
GET http://localhost:4000/api/project/all

// Expected: 401
{
  "status": "fail",
  "message": "Please log in to access this resource"
}
```

### Test Not Found Errors
```javascript
// Invalid ID
GET http://localhost:4000/api/project/invalid-id

// Expected: 400 (Cast error) or 404 (Not found)
```

## Monitoring and Logging

### Development
- All errors logged to console with full stack traces
- Error objects included in responses

### Production
- Operational errors logged briefly
- Programming errors logged with full details
- Stack traces NOT sent to clients
- Critical errors trigger alerts (TODO: integrate monitoring service)

## Future Enhancements

1. **External Logging Service**
   - Integrate with services like Sentry, LogRocket, or Datadog
   - Track error trends and patterns

2. **Error Analytics**
   - Monitor error rates
   - Alert on error spikes
   - Track resolution times

3. **Custom Error Pages**
   - User-friendly error pages for web interface
   - Branded error responses

4. **Error Recovery**
   - Automatic retry for transient errors
   - Circuit breaker for external services
   - Fallback strategies

5. **Performance Monitoring**
   - Track slow queries
   - Monitor memory usage
   - Alert on performance degradation
