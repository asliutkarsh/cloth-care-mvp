// services/userService.js
import { StorageService } from './storageService.js';

const USER_TABLE = StorageService.KEYS.USER;

export const UserService = {
  async getUser() {
    try {
      const user = await StorageService.getById(USER_TABLE, 'user');
      if (!user) return null;
      const { id, ...rest } = user;
      return rest;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user) {
    try {
      // Clear any existing user data first to avoid conflicts
      await StorageService.clear(USER_TABLE);

      // Use 'user' as the ID for consistency
      const data = { id: 'user', ...user };
      await StorageService.put(USER_TABLE, data);

      return { ...user };
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  async updateUser(updates) {
    try {
      const existing = (await this.getUser()) || {};
      const updatedUser = { ...existing, ...updates };
      await StorageService.put(USER_TABLE, { id: 'user', ...updatedUser });
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async clearUser() {
    try {
      await StorageService.remove(USER_TABLE, 'user');
      return true;
    } catch (error) {
      console.error('Error clearing user:', error);
      return false;
    }
  },

  async getCurrentUser() {
    try {
      return await StorageService.getById(USER_TABLE, 'user');
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};