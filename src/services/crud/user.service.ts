import { StorageService } from '../setup/storage.service';
import { User } from '../model/user.model';

interface UserData {
  name: string;
  email: string;
}

export const UserService = {
  async getUser(): Promise<Omit<User, 'id'> | null> {
    try {
      const user = await StorageService.getById<User>(StorageService.KEYS.USER, 'user');
      return user ? { ...user } : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  async setUser(user: UserData): Promise<UserData> {
    try {
      // Clear any existing user data first to avoid conflicts
      await StorageService.clear(StorageService.KEYS.USER);

      // Use 'user' as the ID for consistency
      const data: User = { id: 'user', ...user };
      await StorageService.put(StorageService.KEYS.USER, data);

      return { ...user };
    } catch (error) {
      console.error('Error setting user:', error);
      throw error;
    }
  },

  async updateUser(updates: Partial<UserData>): Promise<UserData | null> {
    try {
      const existing = await this.getUser();
      if (!existing) return null;

      const updatedUser = { ...existing, ...updates };
      await StorageService.put(StorageService.KEYS.USER, { id: 'user', ...updatedUser });
      return updatedUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async clearUser(): Promise<boolean> {
    try {
      await StorageService.remove(StorageService.KEYS.USER, 'user');
      return true;
    } catch (error) {
      console.error('Error clearing user:', error);
      return false;
    }
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      const user = await StorageService.getById<User>(StorageService.KEYS.USER, 'user');
      return user || null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },
};
