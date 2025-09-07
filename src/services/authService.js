// src/services/authService.js
import { UserService } from "./userService.js";
import { v4 as uuidv4 } from 'uuid';

const USERS_KEY = 'wardrobe_users';

const getMockUsers = () => {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
};
const setMockUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthService = {
  async signup(credentials) {
    const { name, email, password } = credentials;
    const users = getMockUsers();
    
    if (users.find(u => u.email === email)) {
      throw new Error('User with this email already exists.');
    }

    const newUser = { id: uuidv4(), name, email, password };
    setMockUsers([...users, newUser]);

    await UserService.setUser({ id: newUser.id, email: newUser.email, name: newUser.name });
    return newUser;
  },

  async login(credentials) {
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
    
    const userToSet = { id: foundUser.id, email: foundUser.email, name: foundUser.name };
    await UserService.setUser(userToSet);
    return userToSet;
  },

  async logout() {
    await UserService.clearUser();
    return true;
  },

  async getCurrentUser() {
    return UserService.getUser();
  },
};