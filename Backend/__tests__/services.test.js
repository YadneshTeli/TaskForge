import { describe, test, expect } from '@jest/globals';
import notificationService from '../src/services/notification.service.js';
import commentService from '../src/services/comment.service.js';
import uploadService from '../src/services/upload.service.js';
import reportService from '../src/services/report.service.js';

describe('Notification Service Tests', () => {
  test('should export createNotification method', () => {
    expect(typeof notificationService.createNotification).toBe('function');
  });

  test('should export getUserNotifications method', () => {
    expect(typeof notificationService.getUserNotifications).toBe('function');
  });

  test('should export markNotificationAsSeen method', () => {
    expect(typeof notificationService.markNotificationAsSeen).toBe('function');
  });
});

describe('Comment Service Tests', () => {
  test('should export createComment method', () => {
    expect(typeof commentService.createComment).toBe('function');
  });

  test('should export getTaskComments method', () => {
    expect(typeof commentService.getTaskComments).toBe('function');
  });

  test('should export deleteComment method', () => {
    expect(typeof commentService.deleteComment).toBe('function');
  });
});

describe('Upload Service Tests', () => {
  test('should export uploadFile method', () => {
    expect(typeof uploadService.uploadFile).toBe('function');
  });

  test('should be an object with uploadFile function', () => {
    expect(typeof uploadService).toBe('object');
    expect(typeof uploadService.uploadFile).toBe('function');
  });
});

describe('Report Service Tests', () => {
  test('should export generateReport method', () => {
    expect(typeof reportService.generateReport).toBe('function');
  });

  test('should be an object with generateReport function', () => {
    expect(typeof reportService).toBe('object');
    expect(typeof reportService.generateReport).toBe('function');
  });
});
