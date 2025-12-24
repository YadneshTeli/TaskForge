/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before starting the server
 */

const requiredEnvVars = [
    'NODE_ENV',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'DATABASE_URL',
    'MONGO_URI'
];

const optionalEnvVars = [
    'PORT',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'REDIS_URL',
    'CORS_ORIGIN',
    'RATE_LIMIT_WINDOW_MS',
    'RATE_LIMIT_MAX_REQUESTS'
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
        console.error('\n📝 Please check your .env file against .env.example');
        console.error('💡 Copy .env.example to .env and fill in the values\n');
        process.exit(1);
    }
    
    // Warn about optional variables
    const missingOptional = optionalEnvVars.filter(v => !process.env[v]);
    if (missingOptional.length > 0) {
        console.warn('⚠️  Optional environment variables not set:');
        missingOptional.forEach(v => console.warn(`   - ${v}`));
        console.warn('ℹ️  Some features may not work without these variables.\n');
    }
    
    console.log('✅ Environment variables validated successfully');
}

export default validateEnv;
