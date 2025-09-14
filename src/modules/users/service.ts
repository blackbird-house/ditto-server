import { User, CreateUserRequest, UserService } from './types';
import { randomUUID } from 'crypto';

class InMemoryUserService implements UserService {
  private users: Map<string, User> = new Map();

  createUser(userData: CreateUserRequest): User {
    // Check if user with email already exists
    const existingUser = this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const now = new Date();
    const user: User = {
      id: randomUUID(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      phone: userData.phone,
      createdAt: now,
      updatedAt: now,
    };

    this.users.set(user.id, user);
    return user;
  }

  getUserById(id: string): User | null {
    return this.users.get(id) || null;
  }

  getUserByEmail(email: string): User | null {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  updateUser(id: string, userData: Partial<CreateUserRequest>): User | null {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    // Check if email is being updated and if it already exists
    if (userData.email && userData.email !== user.email) {
      const existingUser = this.getUserByEmail(userData.email);
      if (existingUser) {
        throw new Error('User with this email already exists');
      }
    }

    const updatedUser: User = {
      ...user,
      ...userData,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    return updatedUser;
  }

  deleteUser(id: string): boolean {
    return this.users.delete(id);
  }
}

// Export singleton instance
export const userService = new InMemoryUserService();
