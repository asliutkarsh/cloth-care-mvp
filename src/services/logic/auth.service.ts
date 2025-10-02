import { UserService } from '../crud/user.service';
import { SetupService } from '../setup/setup.service.js';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../model/user.model';

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

interface MockUser {
  id: string;
  name: string;
  email: string;
  password: string;
}

const USERS_KEY = 'wardrobe_users';

const getMockUsers = (): MockUser[] => {
  const users = localStorage.getItem(USERS_KEY);
  return users ? JSON.parse(users) : [];
};

const setMockUsers = (users: MockUser[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthService = {
  async signup(credentials: SignupCredentials): Promise<User> {
    const { name, email, password } = credentials;
    const users = getMockUsers();

    if (users.find(u => u.email === email)) {
      throw new Error('User with this email already exists.');
    }

    const newUser: MockUser = { id: uuidv4(), name, email, password };
    setMockUsers([...users, newUser]);

    // Store user data in IndexedDB as well for persistence
    try {
      await UserService.setUser({ email: newUser.email, name: newUser.name });
    } catch (error) {
      console.error('Failed to store user in IndexedDB:', error);
    }

    return { id: newUser.id, name: newUser.name, email: newUser.email };
  },

  async login(credentials: LoginCredentials): Promise<User> {
    const { email, password } = credentials;
    let users = getMockUsers();

    // **This is the key part**: Ensure demo user always exists for dev
    if (!users.find(u => u.email === 'demo@cloth.com')) {
      users.push({ id: 'demo-user', name: 'Demo User', email: 'demo@cloth.com', password: 'demo123' });
      setMockUsers(users);
    }

    const foundUser = users.find(u => u.email === email && u.password === password);
    if (!foundUser) {
      throw new Error("Invalid credentials");
    }

    const userToSet: User = { id: 'user', email: foundUser.email, name: foundUser.name };

    // Store user data in IndexedDB for persistence
    try {
      await UserService.setUser(userToSet);
    } catch (error) {
      console.error('Failed to store user in IndexedDB:', error);
    }

    return userToSet;
  },

  async demoLogin(): Promise<User> {
    const demoCredentials: LoginCredentials = {
      email: 'demo@cloth.com',
      password: 'demo123'
    };

    return await this.login(demoCredentials);
  },

  async getCurrentUser(): Promise<User | null> {
    try {
      return await UserService.getCurrentUser();
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  },

  async logout(): Promise<boolean> {
    try {
      await UserService.clearUser();
      return true;
    } catch (error) {
      console.error('Error during logout:', error);
      return false;
    }
  },

  async initializeUserSession(): Promise<void> {
    await SetupService.initialize();
  },
};
