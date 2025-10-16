import { User, CreateUserRequest, UserService } from './types';
import { randomUUID } from 'crypto';
import { databaseService } from '../../database';

class DatabaseUserService implements UserService {
  async createUser(userData: CreateUserRequest): Promise<User> {
    const now = new Date();
    const user: User = {
      id: randomUUID(),
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      ...(userData.phone && { phone: userData.phone }),
      ...(userData.authProvider && { authProvider: userData.authProvider }),
      ...(userData.socialId && { socialId: userData.socialId }),
      ...(userData.profilePictureUrl && { profilePictureUrl: userData.profilePictureUrl }),
      createdAt: now,
      updatedAt: now,
    };

    await databaseService.createUser(user);
    return user;
  }

  async getUserById(id: string): Promise<User | null> {
    const user = await databaseService.getUserById(id);
    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.authProvider && { authProvider: user.authProvider }),
      ...(user.socialId && { socialId: user.socialId }),
      ...(user.profilePictureUrl && { profilePictureUrl: user.profilePictureUrl }),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const user = await databaseService.getUserByEmail(email);
    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.authProvider && { authProvider: user.authProvider }),
      ...(user.socialId && { socialId: user.socialId }),
      ...(user.profilePictureUrl && { profilePictureUrl: user.profilePictureUrl }),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };
  }

  async getUserByPhone(phone: string): Promise<User | null> {
    const user = await databaseService.getUserByPhone(phone);
    if (!user) return null;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      ...(user.phone && { phone: user.phone }),
      ...(user.authProvider && { authProvider: user.authProvider }),
      ...(user.socialId && { socialId: user.socialId }),
      ...(user.profilePictureUrl && { profilePictureUrl: user.profilePictureUrl }),
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };
  }

  async getAllUsers(): Promise<User[]> {
    // This method is not implemented in the database service yet
    // For now, return empty array
    return [];
  }

  async updateUser(id: string, userData: Partial<CreateUserRequest>): Promise<User | null> {
    const updatedUser = await databaseService.updateUser(id, userData);
    if (!updatedUser) return null;

    return {
      id: updatedUser.id,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      email: updatedUser.email,
      phone: updatedUser.phone,
      createdAt: new Date(updatedUser.createdAt),
      updatedAt: new Date(updatedUser.updatedAt),
    };
  }

  async deleteUser(id: string): Promise<boolean> {
    return await databaseService.deleteUser(id);
  }
}

export { DatabaseUserService };
