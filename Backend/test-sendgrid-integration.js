#!/usr/bin/env node

/**
 * SendGrid Integration Test Script
 * Tests email service with both dev mode and SendGrid mode
 */

import emailService from './src/utils/email.js';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testEmailService() {
  log('\n🔧 SendGrid Integration Test', 'blue');
  log('='.repeat(60), 'blue');
  
  // Check configuration
  log('\n📋 Configuration Check:', 'yellow');
  log(`   EMAIL_ENABLED: ${process.env.EMAIL_ENABLED || 'false'}`, 'yellow');
  log(`   EMAIL_FROM: ${process.env.EMAIL_FROM || 'noreply@taskforge.com'}`, 'yellow');
  log(`   SENDGRID_API_KEY: ${process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not Set'}`, 'yellow');
  log(`   FRONTEND_URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`, 'yellow');
  
  const testEmail = 'test@example.com';
  const testUsername = 'TestUser';
  const testToken = 'sample-token-abc123xyz';
  
  log('\n📧 Testing Email Methods:', 'blue');
  
  try {
    // Test 1: Verification Email
    log('\n1️⃣  Testing Verification Email...', 'yellow');
    const result1 = await emailService.sendVerificationEmail(testEmail, testToken, testUsername);
    log(`   ✅ ${result1.message}`, 'green');
    
    // Test 2: Password Reset Email
    log('\n2️⃣  Testing Password Reset Email...', 'yellow');
    const result2 = await emailService.sendPasswordResetEmail(testEmail, testToken, testUsername);
    log(`   ✅ ${result2.message}`, 'green');
    
    // Test 3: Invitation Email
    log('\n3️⃣  Testing Invitation Email...', 'yellow');
    const result3 = await emailService.sendInvitationEmail(testEmail, testToken, 'AdminUser', 'Project Alpha');
    log(`   ✅ ${result3.message}`, 'green');
    
    // Test 4: Welcome Email
    log('\n4️⃣  Testing Welcome Email...', 'yellow');
    const result4 = await emailService.sendWelcomeEmail(testEmail, testUsername);
    log(`   ✅ ${result4.message}`, 'green');
    
    // Test 5: Token Generation
    log('\n5️⃣  Testing Token Generation...', 'yellow');
    const token = emailService.generateToken();
    log(`   ✅ Generated token: ${token.substring(0, 20)}... (${token.length} chars)`, 'green');
    
    log('\n' + '='.repeat(60), 'blue');
    log('✨ All Tests Passed!', 'green');
    
    // Instructions
    log('\n📝 Notes:', 'yellow');
    if (process.env.EMAIL_ENABLED === 'true') {
      if (process.env.SENDGRID_API_KEY) {
        log('   ✅ SendGrid is ENABLED and configured', 'green');
        log('   📧 Real emails will be sent via SendGrid', 'green');
        log('   ⚠️  Check your SendGrid dashboard for delivery status', 'yellow');
      } else {
        log('   ⚠️  EMAIL_ENABLED=true but SENDGRID_API_KEY is missing', 'yellow');
        log('   📧 Emails will be logged to console instead', 'yellow');
      }
    } else {
      log('   ℹ️  Running in DEV MODE (EMAIL_ENABLED=false)', 'blue');
      log('   📧 Emails are logged to console (not sent)', 'blue');
    }
    
    log('\n🚀 To enable real email sending:', 'yellow');
    log('   1. Get SendGrid API key from: https://sendgrid.com/');
    log('   2. Verify sender email in SendGrid dashboard');
    log('   3. Add to .env: SENDGRID_API_KEY=your_key_here');
    log('   4. Add to .env: EMAIL_ENABLED=true');
    log('   5. Add to .env: EMAIL_FROM=your_verified_email@domain.com');
    log('   6. Restart the server\n');
    
  } catch (error) {
    log(`\n❌ Test Failed: ${error.message}`, 'red');
    if (error.response?.body) {
      log(`   SendGrid Error: ${JSON.stringify(error.response.body, null, 2)}`, 'red');
    }
    console.error(error);
    process.exit(1);
  }
}

// Run tests
testEmailService().catch((error) => {
  log(`\n❌ Fatal Error: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
