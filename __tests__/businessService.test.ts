import { BusinessUserService } from '../src/modules/users/businessService';
import { User, CreateUserRequest, UserService } from '../src/modules/users/types';

// Mock data service for testing
class MockDataService implements UserService {
  private users: Map<string, User> = new Map();
  private nextId = 1;

  async createUser(userData: CreateUserRequest): Promise<User> {
    const user: User = {
      id: `user-${this.nextId++}`,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    return this.users.get(id) || null;
  }

  async getUserByEmail(email: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.email === email) {
        return user;
      }
    }
    return null;
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    for (const user of this.users.values()) {
      if (user.phone === phone) {
        return user;
      }
    }
    return null;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User | null> {
    const user = this.users.get(id);
    if (!user) return null;

    const updatedUser = { ...user, ...userData, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}

describe('BusinessUserService', () => {
  let businessService: BusinessUserService;
  let mockDataService: MockDataService;

  beforeEach(() => {
    mockDataService = new MockDataService();
    businessService = new BusinessUserService(mockDataService);
  });

  describe('createUser', () => {
    it('should create user when email is unique', async () => {
      const userData: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const result = await businessService.createUser(userData);

      expect(result).toHaveProperty('id');
      expect(result.firstName).toBe('John');
      expect(result.lastName).toBe('Doe');
      expect(result.email).toBe('john.doe@example.com');
      expect(result.phone).toBe('+1234567890');
    });

    it('should throw error when email already exists', async () => {
      const userData: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      // Create first user
      await businessService.createUser(userData);

      // Try to create second user with same email
      await expect(businessService.createUser(userData))
        .rejects
        .toThrow('User with this email already exists');
    });

    it('should allow different users with different emails', async () => {
      const user1Data: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const user2Data: CreateUserRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321'
      };

      const user1 = await businessService.createUser(user1Data);
      const user2 = await businessService.createUser(user2Data);

      expect(user1.email).toBe('john.doe@example.com');
      expect(user2.email).toBe('jane.smith@example.com');
      expect(user1.id).not.toBe(user2.id);
    });
  });

  describe('updateUser', () => {
    let existingUser: User;

    beforeEach(async () => {
      const userData: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };
      existingUser = await businessService.createUser(userData);
    });

    it('should update user when email is unique', async () => {
      const updateData = {
        firstName: 'Johnny',
        lastName: 'Doe'
      };

      const result = await businessService.updateUser(existingUser.id, updateData);

      expect(result).toHaveProperty('id', existingUser.id);
      expect(result?.firstName).toBe('Johnny');
      expect(result?.lastName).toBe('Doe');
      expect(result?.email).toBe('john.doe@example.com'); // Email unchanged
    });

    it('should update email when new email is unique', async () => {
      const updateData = {
        email: 'johnny.doe@example.com'
      };

      const result = await businessService.updateUser(existingUser.id, updateData);

      expect(result).toHaveProperty('id', existingUser.id);
      expect(result?.email).toBe('johnny.doe@example.com');
    });

    it('should throw error when updating to existing email', async () => {
      // Create another user
      const user2Data: CreateUserRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321'
      };
      await businessService.createUser(user2Data);

      // Try to update first user to second user's email
      const updateData = {
        email: 'jane.smith@example.com'
      };

      await expect(businessService.updateUser(existingUser.id, updateData))
        .rejects
        .toThrow('User with this email already exists');
    });

    it('should allow updating to same email (no change)', async () => {
      const updateData = {
        email: 'john.doe@example.com' // Same email
      };

      const result = await businessService.updateUser(existingUser.id, updateData);

      expect(result).toHaveProperty('id', existingUser.id);
      expect(result?.email).toBe('john.doe@example.com');
    });

    it('should return null for non-existent user', async () => {
      const updateData = {
        firstName: 'Updated'
      };

      const result = await businessService.updateUser('non-existent-id', updateData);

      expect(result).toBeNull();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const userData: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const createdUser = await businessService.createUser(userData);
      const result = await businessService.getUserById(createdUser.id);

      expect(result).toEqual(createdUser);
    });

    it('should return null when user not found', async () => {
      const result = await businessService.getUserById('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('getUserByEmail', () => {
    it('should return user when found by email', async () => {
      const userData: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const createdUser = await businessService.createUser(userData);
      const result = await businessService.getUserByEmail('john.doe@example.com');

      expect(result).toEqual(createdUser);
    });

    it('should return null when user not found by email', async () => {
      const result = await businessService.getUserByEmail('nonexistent@example.com');
      expect(result).toBeNull();
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const user1Data: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const user2Data: CreateUserRequest = {
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+0987654321'
      };

      const user1 = await businessService.createUser(user1Data);
      const user2 = await businessService.createUser(user2Data);

      const result = await businessService.getAllUsers();

      expect(result).toHaveLength(2);
      expect(result).toContainEqual(user1);
      expect(result).toContainEqual(user2);
    });

    it('should return empty array when no users', async () => {
      const result = await businessService.getAllUsers();
      expect(result).toEqual([]);
    });
  });

  describe('deleteUser', () => {
    it('should delete user when found', async () => {
      const userData: CreateUserRequest = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      };

      const createdUser = await businessService.createUser(userData);
      const result = await businessService.deleteUser(createdUser.id);

      expect(result).toBe(true);

      // Verify user is deleted
      const deletedUser = await businessService.getUserById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    it('should return false when user not found', async () => {
      const result = await businessService.deleteUser('non-existent-id');
      expect(result).toBe(false);
    });
  });
});
