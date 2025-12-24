import { describe, test, expect } from '@jest/globals';
import taskService from '../src/services/task.service.js';

describe('Task Service Tests', () => {
  describe('Service exports', () => {
    test('should export createTask method', () => {
      expect(typeof taskService.createTask).toBe('function');
    });

    test('should export getTasksByProject method', () => {
      expect(typeof taskService.getTasksByProject).toBe('function');
    });

    test('should export updateTask method', () => {
      expect(typeof taskService.updateTask).toBe('function');
    });

    test('should export deleteTask method', () => {
      expect(typeof taskService.deleteTask).toBe('function');
    });

    test('should export getTaskAnalytics method', () => {
      expect(typeof taskService.getTaskAnalytics).toBe('function');
    });

    test('should export getUserTaskStats method', () => {
      expect(typeof taskService.getUserTaskStats).toBe('function');
    });
  });

  describe('Service structure', () => {
    test('should be an object', () => {
      expect(typeof taskService).toBe('object');
    });

    test('should have all required methods', () => {
      // Class-based services may not enumerate methods in Object.keys
      // So we check for specific methods instead
      expect(typeof taskService.createTask).toBe('function');
      expect(typeof taskService.getTasksByProject).toBe('function');
      expect(typeof taskService.updateTask).toBe('function');
    });
  });
});
