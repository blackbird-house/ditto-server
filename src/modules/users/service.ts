import { User, CreateUserRequest, UserService } from './types';
import { randomUUID } from 'crypto';
import config from '../../config';
import { DatabaseUserService } from './databaseService';
import { BusinessUserService } from './businessService';

class InMemoryUserService implements UserService {
  private users: Map<string, User> = new Map();

  createUser(userData: CreateUserRequest): User {
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

// Create the appropriate data service based on configuration
const dataService = config.database.type === 'sqlite' 
  ? new DatabaseUserService() 
  : new InMemoryUserService();

// Export business service that wraps the data service
export const userService = new BusinessUserService(dataService);
