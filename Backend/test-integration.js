// Test script to verify all services and routes are properly integrated
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Testing Service and Route Integration...\n');

const results = {
    services: { passed: 0, failed: 0, warnings: 0 },
    routes: { passed: 0, failed: 0, warnings: 0 },
    integration: { passed: 0, failed: 0, warnings: 0 }
};

// Test 1: Verify all services exist and are importable
console.log('📦 Testing Services...');
const services = [
    { path: './src/services/attachment.service.js', name: 'attachment', methods: ['addTaskAttachment', 'removeTaskAttachment'] },
    { path: './src/services/comment.service.js', name: 'comment', methods: ['createComment', 'getTaskComments', 'deleteComment', 'addComment'] },
    { path: './src/services/log.service.js', name: 'log', methods: ['logAction', 'getLogs'] },
    { path: './src/services/notification.service.js', name: 'notification', methods: ['createNotification', 'getUserNotifications', 'markNotificationAsSeen'] },
    { path: './src/services/project.service.js', name: 'project', methods: ['createProject', 'getProjectById', 'getUserProjects'] },
    { path: './src/services/report.service.js', name: 'report', methods: ['generateReport'] },
    { path: './src/services/task.service.js', name: 'task', methods: ['createTask', 'getTasksByProject', 'updateTask'] },
    { path: './src/services/upload.service.js', name: 'upload', methods: ['uploadFile'] },
    { path: './src/services/user.service.js', name: 'user', methods: ['getUserById', 'updateProfile', 'resetPassword'] }
];

for (const service of services) {
    try {
        const module = await import(service.path);
        const exportedService = module.default;
        
        if (!exportedService) {
            console.log(`  ⚠️  ${service.name}.service - No default export`);
            results.services.warnings++;
            continue;
        }
        
        const missingMethods = service.methods.filter(method => typeof exportedService[method] !== 'function');
        
        if (missingMethods.length > 0) {
            console.log(`  ⚠️  ${service.name}.service - Missing methods: ${missingMethods.join(', ')}`);
            results.services.warnings++;
        } else {
            console.log(`  ✅ ${service.name}.service (${service.methods.length} methods)`);
            results.services.passed++;
        }
    } catch (error) {
        console.log(`  ❌ ${service.name}.service - ${error.message}`);
        results.services.failed++;
    }
}

// Test 2: Verify all routes exist
console.log('\n🛣️  Testing Routes...');
const routes = [
    { path: './src/routes/auth.routes.js', name: 'auth' },
    { path: './src/routes/admin.routes.js', name: 'admin' },
    { path: './src/routes/project.routes.js', name: 'project' },
    { path: './src/routes/upload.routes.js', name: 'upload' },
    { path: './src/routes/report.routes.js', name: 'report' },
    { path: './src/routes/user.routes.js', name: 'user' },
    { path: './src/routes/notification.routes.js', name: 'notification' }
];

for (const route of routes) {
    try {
        const module = await import(route.path);
        const router = module.default;
        
        if (!router) {
            console.log(`  ❌ ${route.name}.routes - No default export`);
            results.routes.failed++;
            continue;
        }
        
        console.log(`  ✅ ${route.name}.routes`);
        results.routes.passed++;
    } catch (error) {
        console.log(`  ❌ ${route.name}.routes - ${error.message}`);
        results.routes.failed++;
    }
}

// Test 3: Verify server.js registers all routes
console.log('\n🔌 Testing Route Integration in server.js...');
const serverPath = join(__dirname, 'src', 'server.js');
const serverContent = fs.readFileSync(serverPath, 'utf-8');

const expectedRouteRegistrations = [
    { route: '/api/auth', name: 'auth' },
    { route: '/api/file', name: 'upload' },
    { route: '/api/users', name: 'user' },
    { route: '/api/notifications', name: 'notification' },
    { route: '/api/admin', name: 'admin' },
    { route: '/api/project', name: 'project' },
    { route: '/api/report', name: 'report' },
    { route: '/api/tasks', name: 'task' },
    { route: '/api/comments', name: 'comment' }
];

for (const registration of expectedRouteRegistrations) {
    if (serverContent.includes(`app.use("${registration.route}"`)) {
        console.log(`  ✅ ${registration.name} route registered at ${registration.route}`);
        results.integration.passed++;
    } else {
        console.log(`  ⚠️  ${registration.name} route NOT registered at ${registration.route}`);
        results.integration.warnings++;
    }
}

// Test 4: Check for TODO placeholders (should be none now)
console.log('\n🔍 Checking for TODO placeholders...');
const projectRoutesPath = join(__dirname, 'src', 'routes', 'project.routes.js');
const projectRoutesContent = fs.readFileSync(projectRoutesPath, 'utf-8');

const todoMatches = projectRoutesContent.match(/TODO:/g);
if (todoMatches) {
    console.log(`  ⚠️  Found ${todoMatches.length} TODO placeholders in project.routes.js`);
    results.integration.warnings++;
} else {
    console.log(`  ✅ No TODO placeholders found`);
    results.integration.passed++;
}

// Test 5: Verify asyncHandler utility exists
console.log('\n🛠️  Testing Utilities...');
try {
    await import('./src/utils/asyncHandler.js');
    console.log('  ✅ asyncHandler utility');
    results.integration.passed++;
} catch (error) {
    console.log('  ❌ asyncHandler utility - ' + error.message);
    results.integration.failed++;
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('📊 Integration Test Summary\n');
console.log(`Services:`);
console.log(`  ✅ Passed:   ${results.services.passed}`);
console.log(`  ⚠️  Warnings: ${results.services.warnings}`);
console.log(`  ❌ Failed:   ${results.services.failed}`);

console.log(`\nRoutes:`);
console.log(`  ✅ Passed:   ${results.routes.passed}`);
console.log(`  ⚠️  Warnings: ${results.routes.warnings}`);
console.log(`  ❌ Failed:   ${results.routes.failed}`);

console.log(`\nIntegration:`);
console.log(`  ✅ Passed:   ${results.integration.passed}`);
console.log(`  ⚠️  Warnings: ${results.integration.warnings}`);
console.log(`  ❌ Failed:   ${results.integration.failed}`);

const totalTests = results.services.passed + results.routes.passed + results.integration.passed;
const totalWarnings = results.services.warnings + results.routes.warnings + results.integration.warnings;
const totalFailed = results.services.failed + results.routes.failed + results.integration.failed;

console.log(`\nTotal: ${totalTests} passed, ${totalWarnings} warnings, ${totalFailed} failed`);

if (totalFailed === 0 && totalWarnings === 0) {
    console.log('\n✅ All services and routes fully integrated!');
} else if (totalFailed === 0) {
    console.log('\n⚠️  All services and routes integrated with minor warnings');
} else {
    console.log('\n❌ Integration incomplete - please address failures');
}

console.log('='.repeat(50));
