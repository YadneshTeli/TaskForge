/**
 * Service Health Check Script
 * Tests that all services can be imported and have expected methods
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const services = [
    { name: 'attachment.service', methods: ['addTaskAttachment', 'removeTaskAttachment'] },
    { name: 'comment.service', methods: ['createComment', 'getTaskComments', 'deleteComment', 'addComment'] },
    { name: 'log.service', methods: ['logAction', 'getLogs'] },
    { name: 'notification.service', methods: ['createNotification', 'markNotificationAsSeen', 'getUserNotifications'] },
    { name: 'project.service', methods: ['createProject', 'getProjectById', 'getUserProjects', 'updateProject', 'deleteProject', 'addMemberToProject', 'removeMemberFromProject'] },
    { name: 'report.service', methods: ['generateReport'] },
    { name: 'task.service', methods: ['createTask', 'getTasksByProject', 'updateTask', 'deleteTask', 'getTaskAnalytics', 'getUserTaskStats'] },
    { name: 'upload.service', methods: ['uploadFile'] },
    { name: 'user.service', methods: ['updateProfile', 'resetPassword', 'getUserById'] }
];

console.log('🔍 Testing Service Imports and Methods...\n');

let allPassed = true;
const results = [];

for (const service of services) {
    try {
        const servicePath = `./src/services/${service.name}.js`;
        const imported = await import(servicePath);
        const serviceInstance = imported.default;

        if (!serviceInstance) {
            results.push({ name: service.name, status: '❌', message: 'No default export' });
            allPassed = false;
            continue;
        }

        // Check if all expected methods exist
        const missingMethods = [];
        for (const method of service.methods) {
            if (typeof serviceInstance[method] !== 'function') {
                missingMethods.push(method);
            }
        }

        if (missingMethods.length > 0) {
            results.push({ 
                name: service.name, 
                status: '⚠️', 
                message: `Missing methods: ${missingMethods.join(', ')}` 
            });
        } else {
            results.push({ 
                name: service.name, 
                status: '✅', 
                message: `All ${service.methods.length} methods present` 
            });
        }

    } catch (error) {
        results.push({ 
            name: service.name, 
            status: '❌', 
            message: `Import failed: ${error.message}` 
        });
        allPassed = false;
    }
}

// Print results
console.log('Service Health Check Results:');
console.log('================================\n');

for (const result of results) {
    console.log(`${result.status} ${result.name.padEnd(25)} - ${result.message}`);
}

console.log('\n================================');
console.log(`\nOverall Status: ${allPassed ? '✅ All services working!' : '❌ Some services have issues'}`);
console.log(`\nServices checked: ${services.length}`);
console.log(`Passed: ${results.filter(r => r.status === '✅').length}`);
console.log(`Warnings: ${results.filter(r => r.status === '⚠️').length}`);
console.log(`Failed: ${results.filter(r => r.status === '❌').length}`);

process.exit(allPassed ? 0 : 1);
