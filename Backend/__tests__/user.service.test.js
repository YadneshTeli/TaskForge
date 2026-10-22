import { describe, test, expect, beforeEach, afterEach, afterAll, jest } from '@jest/globals';
import bcrypt from 'bcryptjs';
import userService, { prisma } from '../src/services/user.service.js';

describe('User Service Tests', () => {
  const store = new Map();
  let nextId = 1;
  const createdIds = new Set();

  beforeEach(() => {
    createdIds.clear();

    jest.spyOn(prisma.user, 'create').mockImplementation(async ({ data }) => {
      const id = data.id ?? nextId++;
      const now = new Date();
      const user = {
        id,
        email: data.email,
        username: data.username,
        password: data.password,
        fullName: data.fullName ?? null,
        bio: data.bio ?? null,
        profilePicture: data.profilePicture ?? null,
        role: data.role ?? 'USER',
        isActive: data.isActive ?? true,
        isOnline: data.isOnline ?? false,
        lastSeen: data.lastSeen ?? now,
        createdAt: data.createdAt ?? now,
        updatedAt: now,
      };
      store.set(id, user);
      createdIds.add(id);
      return { ...user };
    });

    jest.spyOn(prisma.user, 'findUnique').mockImplementation(async ({ where }) => {
      const user = store.get(where.id);
      return user ? { ...user } : null;
    });

    jest.spyOn(prisma.user, 'update').mockImplementation(async ({ where, data }) => {
      const existing = store.get(where.id);
      if (!existing) {
        const error = new Error('Record to update not found.');
        error.code = 'P2025';
        throw error;
      }
      const updated = { ...existing, ...data, updatedAt: new Date() };
      store.set(where.id, updated);
      return { ...updated };
    });

    jest.spyOn(prisma.user, 'delete').mockImplementation(async ({ where }) => {
      const existing = store.get(where.id);
      if (!existing) {
        const error = new Error('Record to delete does not exist.');
        error.code = 'P2025';
        throw error;
      }
      store.delete(where.id);
      createdIds.delete(where.id);
      return { ...existing };
    });

    jest.spyOn(prisma.user, 'findMany').mockImplementation(async ({ where, select } = {}) => {
      let users = Array.from(store.values());
      if (where?.isActive !== undefined) {
        users = users.filter((u) => u.isActive === where.isActive);
      }
      if (select) {
        return users.map((u) => {
          const picked = {};
          for (const key of Object.keys(select)) {
            if (select[key]) picked[key] = u[key];
          }
          return picked;
        });
      }
      return users.map((u) => ({ ...u }));
    });
  });

  afterEach(async () => {
    // Deterministically clean up any test users created during the test
    for (const id of Array.from(createdIds)) {
      await prisma.user.delete({ where: { id } }).catch(() => {});
    }
    createdIds.clear();
    jest.restoreAllMocks();
  });

  afterAll(async () => {
    store.clear();
    await prisma.$disconnect();
  });

  describe('createUser and getAllUsers', () => {
    test('should create a user and return active users via getAllUsers', async () => {
      const created = await userService.createUser({
        email: `create-${Date.now()}@example.com`,
        username: `createuser_${Date.now()}`,
        password: 'hashedpassword',
        fullName: 'Created User',
      });

      expect(created).toBeDefined();
      expect(created.id).toBeDefined();
      expect(created.fullName).toBe('Created User');

      const allUsers = await userService.getAllUsers();
      expect(Array.isArray(allUsers)).toBe(true);
      expect(allUsers.some((u) => u.id === created.id && u.email === created.email)).toBe(true);
      expect(allUsers[0].password).toBeUndefined();
    });
  });

  describe('getUserById', () => {
    test('should return user when valid ID is provided', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-user-' + Date.now() + '@example.com',
          username: 'testuser' + Date.now(),
          password: 'hashedpassword',
          fullName: 'Test User',
        },
      });

      const result = await userService.getUserById(String(testUser.id));

      expect(result).toBeDefined();
      expect(result.id).toBe(testUser.id);
      expect(result.email).toBe(testUser.email);
      expect(result.username).toBe(testUser.username);
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
          fullName: 'Test Update User',
        },
      });

      const updates = {
        fullName: 'Updated Name',
        bio: 'Updated bio',
      };

      const result = await userService.updateProfile(testUser.id, updates);

      expect(result).toBeDefined();
      expect(result.fullName).toBe('Updated Name');
      expect(result.bio).toBe('Updated bio');
    });

    test('should throw error when updating non-existent user', async () => {
      await expect(
        userService.updateProfile(999999, { fullName: 'Test' })
      ).rejects.toThrow('Record to update not found.');
    });
  });

  describe('resetPassword', () => {
    test('should reset password successfully and hash the new password', async () => {
      const testUser = await prisma.user.create({
        data: {
          email: 'test-password-' + Date.now() + '@example.com',
          username: 'testpassword' + Date.now(),
          password: 'oldpassword',
          fullName: 'Test Password User',
        },
      });

      const newPassword = 'NewSecurePassword1';
      const result = await userService.resetPassword(testUser.id, newPassword);

      expect(result).toBeDefined();
      expect(result.password).not.toBe('oldpassword');
      expect(result.password).not.toBe(newPassword);
      const isMatch = await bcrypt.compare(newPassword, result.password);
      expect(isMatch).toBe(true);
    });

    test('should reject weak passwords that do not meet complexity requirements', async () => {
      await expect(userService.resetPassword(1, 'short')).rejects.toThrow(
        'Password must be at least 8 characters, include a number and an uppercase letter.'
      );
      await expect(userService.resetPassword(1, 'alllowercase123')).rejects.toThrow(
        'Password must be at least 8 characters, include a number and an uppercase letter.'
      );
      await expect(userService.resetPassword(1, 'NoNumbersHere')).rejects.toThrow(
        'Password must be at least 8 characters, include a number and an uppercase letter.'
      );
    });
  });
});
