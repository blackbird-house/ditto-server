import config from '../config';
import { SQLiteDatabase, getDatabase } from './sqlite';

export interface DatabaseService {
  // User operations
  createUser(userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<void>;
  getUserById(id: string): Promise<any>;
  getUserByEmail(email: string): Promise<any>;
  getUserByPhone(phone: string): Promise<any>;
  updateUser(id: string, updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>): Promise<any>;
  deleteUser(id: string): Promise<boolean>;

  // OTP operations
  createOtpSession(sessionData: {
    id: string;
    phone: string;
    otp: string;
    expiresAt: Date;
  }): Promise<void>;
  getOtpSession(phone: string): Promise<any>;
  deleteOtpSession(id: string): Promise<void>;
  cleanupExpiredOtpSessions(): Promise<void>;

  // Chat operations
  createChat(chatData: {
    id: string;
    user1Id: string;
    user2Id: string;
  }): Promise<void>;
  getChatById(id: string): Promise<any>;
  getChatByParticipants(user1Id: string, user2Id: string): Promise<any>;
  getUserChats(userId: string): Promise<any[]>;
  updateChatUpdatedAt(chatId: string): Promise<void>;

  // Message operations
  createMessage(messageData: {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
  }): Promise<void>;
  getChatMessages(chatId: string): Promise<any[]>;
  getLastMessageForChat(chatId: string): Promise<any>;
}

class DatabaseServiceWrapper implements DatabaseService {
  private sqliteDb: SQLiteDatabase | null = null;

  constructor() {
    // Initialize SQLite if configured
    if (config.database.type === 'sqlite') {
      this.sqliteDb = getDatabase(config.database.url);
    }
  }

  // User operations
  async createUser(userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.createUser(userData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserById(id: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserById(id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserByEmail(email);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserByPhone(phone: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserByPhone(phone);
    } else {
      throw new Error('Database not configured');
    }
  }

  async updateUser(id: string, updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.updateUser(id, updates);
    } else {
      throw new Error('Database not configured');
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.sqliteDb) {
      return this.sqliteDb.deleteUser(id);
    } else {
      throw new Error('Database not configured');
    }
  }

  // OTP operations
  async createOtpSession(sessionData: {
    id: string;
    phone: string;
    otp: string;
    expiresAt: Date;
  }): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.createOtpSession(sessionData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getOtpSession(phone: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getOtpSession(phone);
    } else {
      throw new Error('Database not configured');
    }
  }

  async deleteOtpSession(id: string): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.deleteOtpSession(id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async cleanupExpiredOtpSessions(): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.cleanupExpiredOtpSessions();
    } else {
      throw new Error('Database not configured');
    }
  }

  // Chat operations
  async createChat(chatData: {
    id: string;
    user1Id: string;
    user2Id: string;
  }): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.createChat(chatData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getChatById(id: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getChatById(id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getChatByParticipants(user1Id: string, user2Id: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getChatByParticipants(user1Id, user2Id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserChats(userId: string): Promise<any[]> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserChats(userId);
    } else {
      throw new Error('Database not configured');
    }
  }

  async updateChatUpdatedAt(chatId: string): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.updateChatUpdatedAt(chatId);
    } else {
      throw new Error('Database not configured');
    }
  }

  // Message operations
  async createMessage(messageData: {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
  }): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.createMessage(messageData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getChatMessages(chatId: string): Promise<any[]> {
    if (this.sqliteDb) {
      return this.sqliteDb.getChatMessages(chatId);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getLastMessageForChat(chatId: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getLastMessageForChat(chatId);
    } else {
      throw new Error('Database not configured');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseServiceWrapper();
