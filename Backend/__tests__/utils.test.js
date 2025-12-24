import { describe, test, expect } from '@jest/globals';

describe('Utility Functions Tests', () => {
  describe('JWT Utilities', () => {
    test('should import jwt utilities without errors', async () => {
      const jwtUtils = await import('../src/utils/jwt.js');
      
      expect(jwtUtils.signToken).toBeDefined();
      expect(jwtUtils.signRefreshToken).toBeDefined();
      expect(jwtUtils.verifyToken).toBeDefined();
      expect(jwtUtils.verifyRefreshToken).toBeDefined();
    });
  });

  describe('Error Classes', () => {
    test('should import error classes without errors', async () => {
      const errors = await import('../src/utils/errors.js');
      
      expect(errors.AppError).toBeDefined();
      expect(errors.AuthenticationError).toBeDefined();
      expect(errors.AuthorizationError).toBeDefined();
      expect(errors.NotFoundError).toBeDefined();
      expect(errors.ValidationError).toBeDefined();
    });

    test('AppError should be a class', async () => {
      const { AppError } = await import('../src/utils/errors.js');
      
      const error = new AppError('Test error', 400);
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(400);
      expect(error.isOperational).toBe(true);
    });

    test('NotFoundError should have 404 status code', async () => {
      const { NotFoundError } = await import('../src/utils/errors.js');
      
      const error = new NotFoundError('Resource', 'abc123');
      expect(error.statusCode).toBe(404);
      expect(error.message).toContain('Resource');
      expect(error.message).toContain('abc123');
      expect(error.message).toContain('not found');
    });
  });

  describe('Pagination Utilities', () => {
    test('should import pagination utilities without errors', async () => {
      const pagination = await import('../src/utils/pagination.js');
      expect(pagination).toBeDefined();
    });
  });

  describe('AsyncHandler', () => {
    test('should import asyncHandler without errors', async () => {
      const asyncHandler = await import('../src/utils/asyncHandler.js');
      expect(asyncHandler.default).toBeDefined();
      expect(typeof asyncHandler.default).toBe('function');
    });

    test('asyncHandler should wrap async functions', async () => {
      const { default: asyncHandler } = await import('../src/utils/asyncHandler.js');
      
      const testFn = asyncHandler(async (req, res) => {
        res.status(200).json({ message: 'success' });
      });
      
      expect(typeof testFn).toBe('function');
    });
  });
});
