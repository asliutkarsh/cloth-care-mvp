// services/userService.js
import { StorageService } from "./storageService.js";

// Use the key from the central storage service
const USER_KEY = StorageService.KEYS.USER;

export const UserService = {
  async getUser() {
    return (await StorageService.get(USER_KEY)) || null;
  },

  async setUser(user) {
    await StorageService.set(USER_KEY, user);
    return user;
  },

  async updateUser(updates) {
    const user = (await this.getUser()) || {};
    const updated = { ...user, ...updates };
    await StorageService.set(USER_KEY, updated);
    return updated;
  },

  async clearUser() {
    await StorageService.remove(USER_KEY);
    return true;
  },
};