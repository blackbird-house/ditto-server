import { User, CreateUserRequest, UserService } from './types';

/**
 * Business logic layer that wraps the data access layer
 * Handles business rules like email uniqueness validation
 */
class BusinessUserService {
  constructor(private dataService: UserService) {}

  async createUser(userData: CreateUserRequest): Promise<User> {
    // Business rule: Check if user with email already exists
    const existingUser = await this.dataService.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    return await this.dataService.createUser(userData);
  }

  async getUserById(id: string): Promise<User | null> {
    return await this.dataService.getUserById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.dataService.getUserByEmail(email);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.dataService.getAllUsers();
  }

  async updateUser(
    id: string,
    userData: Partial<CreateUserRequest>
  ): Promise<User | null> {
    // Business rule: Check if email is being updated and if it already exists
    if (userData.email) {
      const existingUser = await this.dataService.getUserByEmail(
        userData.email
      );
      if (existingUser && existingUser.id !== id) {
        throw new Error('User with this email already exists');
      }
    }

    return await this.dataService.updateUser(id, userData);
  }

  async deleteUser(id: string): Promise<boolean> {
    return await this.dataService.deleteUser(id);
  }
}

export { BusinessUserService };
