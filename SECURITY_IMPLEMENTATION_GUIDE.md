# Security Implementation Guide - TaskForge

This guide provides detailed instructions for implementing the security fixes identified in the code review.

## Quick Wins (Implemented ✅)

### 1. Fixed Uninitialized Prisma Client ✅
**File:** `Backend/src/routes/auth.routes.js`

Added missing Prisma client initialization:
```javascript
const prisma = new PrismaClient();
```

### 2. Added Missing JWT_REFRESH_SECRET ✅
**File:** `Backend/.env.example`

Added the missing environment variable:
```bash
JWT_REFRESH_SECRET=your_super_secret_jwt_refresh_key_2024_taskforge_development
```

### 3. Fixed Frontend Vulnerabilities ✅
Upgraded axios and vite packages to patched versions using `npm audit fix`.
**Result:** 0 vulnerabilities remaining in frontend.

### 4. Created Async Handler Utility ✅
**File:** `Backend/src/utils/asyncHandler.js`

Created a reusable async error handler wrapper.

### 5. Added Request Body Size Limits ✅
**File:** `Backend/src/server.js`

Added 10MB limit to prevent DoS attacks:
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

### 6. Enhanced Database Connection with Retry Logic ✅
**File:** `Backend/src/config/db.js`

Implemented exponential backoff retry logic with connection event handlers.

### 7. Enhanced Health Check Endpoint ✅
**File:** `Backend/src/server.js`

Added database connectivity checks for both MongoDB and PostgreSQL.

### 8. Added Environment Variable Validation ✅
**File:** `Backend/src/config/validateEnv.js`

Created validation utility and integrated into server startup.

### 9. Created Password Strength Validator ✅
**File:** `Backend/src/utils/passwordValidator.js`

Utility for validating password requirements and calculating strength.

### 10. Created Standardized Validation Middleware ✅
**File:** `Backend/src/middleware/validate.js`

Consistent validation error response format.

---

## Remaining Critical Fixes (TODO)

### 1. Update GraphQL Upload Package

**Issue:** High severity vulnerability in `graphql-upload` package.

**Current Version:** <=14.0.0  
**Fixed Version:** 17.0.0

**Steps:**
```bash
cd Backend
npm install graphql-upload@17.0.0
```

**Note:** This is a breaking change. Review the [migration guide](https://github.com/jaydenseric/graphql-upload/releases) before upgrading.

**Alternative:** If GraphQL upload functionality is not being used, consider removing it:
```bash
npm uninstall graphql-upload
```

---

### 2. Implement Async Handler in Routes

**Purpose:** Prevent uncaught promise rejections that can crash the Node.js process.

**Example Implementation:**

```javascript
// Before
router.post("/login", protect, async (req, res) => {
    const user = await prisma.user.findUnique({ where: { email } });
    res.json({ token });
});

// After
const asyncHandler = require('../utils/asyncHandler');

router.post("/login", protect, asyncHandler(async (req, res) => {
    const user = await prisma.user.findUnique({ where: { email } });
    res.json({ token });
}));
```

**Files to Update:**
- `src/routes/auth.routes.js`
- `src/routes/task.routes.js`
- `src/routes/project.routes.js`
- `src/routes/comment.routes.js`
- `src/routes/admin.routes.js`
- `src/routes/report.routes.js`

---

### 3. Move CORS Origins to Environment Variables

**Current Issue:** Hardcoded IP addresses in `server.js`

**File:** `Backend/src/server.js`

**Before:**
```javascript
const allowedOrigins = [
  "https://your-frontend-domain.com", 
  "http://localhost:3000",
  "http://10.72.125.97:3000",      // Hardcoded IP
  "http://192.168.56.1:3000",
];
```

**After:**
```javascript
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  "http://localhost:3000",
  "http://localhost:5173"
];
```

**Update `.env.example`:**
```bash
# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:5173,https://your-production-domain.com
```

---

### 4. Enhance Database Connection Error Handling

**File:** `Backend/src/config/db.js`

**Current Code:**
```javascript
const connectMongo = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
    }
};
```

**Improved Version:**
```javascript
const connectMongo = async (retries = 5) => {
    for (let i = 0; i < retries; i++) {
        try {
            await mongoose.connect(process.env.MONGO_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });
            console.log("✅ MongoDB connected");
            return true;
        } catch (err) {
            console.error(`❌ MongoDB connection attempt ${i + 1}/${retries} failed:`, err.message);
            
            if (i === retries - 1) {
                console.error("❌ Failed to connect to MongoDB after multiple attempts");
                process.exit(1); // Exit if database is unavailable
            }
            
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};
```

---

### 5. Add Request Body Size Limits

**File:** `Backend/src/server.js`

**Current:**
```javascript
app.use(express.json());
```

**Updated:**
```javascript
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
```

---

### 6. Standardize Validation Middleware

**Create:** `Backend/src/middleware/validate.js`

```javascript
const { validationResult } = require('express-validator');

/**
 * Middleware to check validation results
 * Use after express-validator validation chains
 */
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ 
            success: false,
            errors: errors.array() 
        });
    }
    next();
};

module.exports = validate;
```

**Usage:**
```javascript
const { body } = require('express-validator');
const validate = require('../middleware/validate');

router.post('/login',
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    validate, // Add this middleware
    asyncHandler(async (req, res) => {
        // Handler code
    })
);
```

---

### 7. Enhance Health Check Endpoint

**File:** `Backend/src/server.js`

**Replace current health check with:**
```javascript
app.get('/api/health', asyncHandler(async (req, res) => {
    const health = {
        status: 'OK',
        timestamp: new Date().toISOString(),
        server: 'TaskForge Backend',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        checks: {}
    };

    // Check MongoDB
    try {
        const mongoState = mongoose.connection.readyState;
        health.checks.mongodb = {
            status: mongoState === 1 ? 'connected' : 'disconnected',
            state: mongoState
        };
    } catch (error) {
        health.checks.mongodb = {
            status: 'error',
            message: error.message
        };
    }

    // Check Prisma/PostgreSQL
    try {
        await prisma.$queryRaw`SELECT 1`;
        health.checks.postgresql = {
            status: 'connected'
        };
    } catch (error) {
        health.checks.postgresql = {
            status: 'error',
            message: error.message
        };
    }

    // Overall status
    const allHealthy = Object.values(health.checks)
        .every(check => check.status === 'connected');
    
    health.status = allHealthy ? 'OK' : 'DEGRADED';

    res.status(allHealthy ? 200 : 503).json(health);
}));
```

---

### 8. Add Environment Variable Validation

**Create:** `Backend/src/config/validateEnv.js`

```javascript
const requiredEnvVars = [
    'NODE_ENV',
    'PORT',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATABASE_URL',
    'MONGO_URI'
];

const optionalEnvVars = [
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'REDIS_URL'
];

function validateEnv() {
    const missing = [];
    
    for (const envVar of requiredEnvVars) {
        if (!process.env[envVar]) {
            missing.push(envVar);
        }
    }
    
    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:');
        missing.forEach(v => console.error(`   - ${v}`));
        console.error('\nPlease check your .env file against .env.example');
        process.exit(1);
    }
    
    // Warn about optional variables
    const missingOptional = optionalEnvVars.filter(v => !process.env[v]);
    if (missingOptional.length > 0) {
        console.warn('⚠️  Optional environment variables not set:');
        missingOptional.forEach(v => console.warn(`   - ${v}`));
        console.warn('Some features may not work without these variables.\n');
    }
    
    console.log('✅ Environment variables validated');
}

module.exports = validateEnv;
```

**Usage in `server.js`:**
```javascript
require("dotenv").config();
const validateEnv = require('./config/validateEnv');

// Validate environment variables before starting
validateEnv();

// Rest of server.js...
```

---

### 9. Implement Stricter Password Requirements

**Create:** `Backend/src/utils/passwordValidator.js`

```javascript
/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 * - At least one special character
 */
function validatePasswordStrength(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
        errors.push(`Password must be at least ${minLength} characters long`);
    }
    if (!hasUpperCase) {
        errors.push('Password must contain at least one uppercase letter');
    }
    if (!hasLowerCase) {
        errors.push('Password must contain at least one lowercase letter');
    }
    if (!hasNumbers) {
        errors.push('Password must contain at least one number');
    }
    if (!hasSpecialChar) {
        errors.push('Password must contain at least one special character');
    }
    
    return {
        isValid: errors.length === 0,
        errors
    };
}

module.exports = { validatePasswordStrength };
```

---

### 10. Add Rate Limiting to Auth Routes

**Update:** `Backend/src/routes/auth.routes.js`

```javascript
const rateLimit = require('express-rate-limit');

// Stricter rate limit for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: 'Too many login attempts, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

// Stricter rate limit for registration
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour
    message: 'Too many accounts created, please try again later',
    standardHeaders: true,
    legacyHeaders: false,
});

router.post("/login", loginLimiter, /* ... other middleware ... */);
router.post("/register", registerLimiter, /* ... other middleware ... */);
```

---

## Testing Your Changes

After implementing these fixes, test thoroughly:

1. **Test Environment Variables:**
```bash
cd Backend
cp .env.example .env
# Fill in all required values
npm start
```

2. **Test Health Endpoint:**
```bash
curl http://localhost:4000/api/health
```

3. **Test Authentication:**
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!","username":"testuser"}'

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'
```

4. **Test Rate Limiting:**
Try logging in 6 times quickly to trigger rate limiting.

5. **Test Error Handling:**
Try invalid requests to ensure errors are properly caught.

---

## Security Checklist

- [x] Prisma client initialized
- [x] JWT_REFRESH_SECRET added to environment
- [x] Frontend vulnerabilities fixed (0 remaining)
- [x] Backend critical vulnerabilities fixed (sha.js, validator)
- [x] Async handler utility created
- [x] Request body size limits added
- [x] Database connection retry logic added
- [x] Health check enhanced with database checks
- [x] Environment variable validation added
- [x] Password strength validator created
- [x] Standardized validation middleware created
- [ ] GraphQL upload package updated (requires breaking changes)
- [ ] Async handlers applied to all routes
- [ ] CORS origins moved to environment variables
- [ ] Rate limiting added to auth routes

---

## Additional Recommendations

### Short Term:
1. Add request ID tracking for better debugging
2. Implement structured logging with Winston
3. Add API documentation with Swagger
4. Create unit tests for critical services
5. Add integration tests for API endpoints

### Medium Term:
1. Consider TypeScript migration
2. Implement API versioning
3. Add database indexes
4. Implement caching strategy
5. Add monitoring and observability

### Long Term:
1. Security audit by professional firm
2. Performance optimization
3. Load testing
4. Disaster recovery plan
5. CI/CD pipeline enhancements

---

**Last Updated:** 2025-11-08
**Maintainer:** Development Team
