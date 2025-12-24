import { describe, test, expect } from '@jest/globals';
import projectService from '../src/services/project.service.js';

describe('Project Service Tests', () => {
  describe('Service exports', () => {
    test('should export createProject method', () => {
      expect(typeof projectService.createProject).toBe('function');
    });

    test('should export getProjectById method', () => {
      expect(typeof projectService.getProjectById).toBe('function');
    });

    test('should export getUserProjects method', () => {
      expect(typeof projectService.getUserProjects).toBe('function');
    });

    test('should export updateProject method', () => {
      expect(typeof projectService.updateProject).toBe('function');
    });

    test('should export deleteProject method', () => {
      expect(typeof projectService.deleteProject).toBe('function');
    });

    test('should export addMemberToProject method', () => {
      expect(typeof projectService.addMemberToProject).toBe('function');
    });

    test('should export removeMemberFromProject method', () => {
      expect(typeof projectService.removeMemberFromProject).toBe('function');
    });
  });

  describe('Service structure', () => {
    test('should be an object', () => {
      expect(typeof projectService).toBe('object');
    });

    test('should have all required methods', () => {
      // Class-based services may not enumerate methods in Object.keys
      // So we check for specific methods instead
      expect(typeof projectService.createProject).toBe('function');
      expect(typeof projectService.getProjectById).toBe('function');
      expect(typeof projectService.getUserProjects).toBe('function');
    });
  });
});
