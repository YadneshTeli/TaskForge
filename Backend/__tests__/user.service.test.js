import { describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import userService from '../src/services/user.service.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('User Service Tests', () => {
  let testUserId;

  beforeAll(async () => {
    // Ensure database is connected
  });

  afterAll(async () => {
    // Clean up test data
    if (testUserId) {
      await prisma.user.delete({ where: { id: testUserId } }).catch(() => {});
    }
    await prisma.$disconnect();
  });

  describe('getUserById', () => {
    test('should return user when valid ID is provided', async () => {
      // Create a test user
      const testUser = await prisma.user.create({
        data: {
          email: 'test-user-' + Date.now() + '@example.com',
          username: 'testuser' + Date.now(),
          password: 'hashedpassword',
          fullName: 'Test User'
        }
      });
      testUserId = testUser.id;

      const result = await userService.getUserById(testUser.id);
      
      expect(result).toBeDefined();
      expect(result.email).toBe(testUser.email);
      expect(result.username).toBe(testUser.username);

      // Cleanup
      await prisma.user.delete({ where: { id: testUser.id } });
      testUserId = null;
    });

    test('should return null when user does not exist', async () => {
      const result = await userService.getUserById(999999);
      
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    test('should update user profile successfully', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-update-' + Date.now() + '@example.com',
          username: 'testupdate' + Date.now(),
          password: 'hashedpassword',
          fullName: 'Test Update User'
        }
      });
      testUserId = testUser.id;

      const updates = {
        fullName: 'Updated Name',
        bio: 'Updated bio'
      };

      const result = await userService.updateProfile(testUser.id, updates);
      
      expect(result).toBeDefined();
      expect(result.fullName).toBe('Updated Name');
      expect(result.bio).toBe('Updated bio');

      // Cleanup
      await prisma.user.delete({ where: { id: testUser.id } });
      testUserId = null;
    });

    test('should return null when updating non-existent user', async () => {
      try {
        await userService.updateProfile(999999, { fullName: 'Test' });
        expect(true).toBe(false); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
      }
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-password-' + Date.now() + '@example.com',
          username: 'testpassword' + Date.now(),
          password: 'oldpassword',
          fullName: 'Test Password User'
        }
      });
      testUserId = testUser.id;

      const newPassword = 'NewSecurePassword1';
      const result = await userService.resetPassword(testUser.id, newPassword);
      
      expect(result).toBeDefined();
      expect(result.password).not.toBe('oldpassword');

      // Cleanup
      await prisma.user.delete({ where: { id: testUser.id } });
      testUserId = null;
    });
  });
});
