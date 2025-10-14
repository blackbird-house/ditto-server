import config from '../config';
import { SQLiteDatabase, getDatabase } from './sqlite';
import { SupabaseDatabase } from './supabase';

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
  getMessages(chatId: string, limit?: number, offset?: number): Promise<any[]>;
  getMessagesBefore(chatId: string, beforeMessageId: string, limit?: number): Promise<any[]>;
  getLastMessage(chatId: string): Promise<any>;
}

class DatabaseServiceWrapper implements DatabaseService {
  private sqliteDb: SQLiteDatabase | null = null;
  private supabaseDb: SupabaseDatabase | null = null;

  constructor() {
    // Initialize database based on configuration
    if (config.database.type === 'sqlite') {
      this.sqliteDb = getDatabase(config.database.url);
    } else if (config.database.type === 'supabase') {
      this.initializeSupabaseSync();
    } else {
      this.sqliteDb = getDatabase(':memory:');
    }
  }

  private initializeSupabaseSync() {
    try {
      // Use require instead of import to avoid module loading issues
      const { getSupabaseDatabase } = require('./supabase');
      
      const supabaseUrl = process.env['DATABASE_URL'];
      const supabaseAnonKey = process.env['DATABASE_KEY'];

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('DATABASE_URL and DATABASE_KEY environment variables are required for Supabase');
      }
      
      this.supabaseDb = getSupabaseDatabase(supabaseUrl, supabaseAnonKey);
    } catch (error) {
      console.error('Failed to initialize Supabase:', error);
      throw error;
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
    } else if (this.supabaseDb) {
      await this.supabaseDb.createUser(userData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserById(id: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserById(id);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getUserById(id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserByEmail(email);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getUserByEmail(email);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserByPhone(phone: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserByPhone(phone);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getUserByPhone(phone);
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
    } else if (this.supabaseDb) {
      return this.supabaseDb.updateUser(id, updates);
    } else {
      throw new Error('Database not configured');
    }
  }

  async deleteUser(id: string): Promise<boolean> {
    if (this.sqliteDb) {
      return this.sqliteDb.deleteUser(id);
    } else if (this.supabaseDb) {
      return this.supabaseDb.deleteUser(id);
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
    } else if (this.supabaseDb) {
      await this.supabaseDb.createOtpSession(sessionData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getOtpSession(phone: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getOtpSession(phone);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getOtpSession(phone);
    } else {
      throw new Error('Database not configured');
    }
  }

  async deleteOtpSession(id: string): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.deleteOtpSession(id);
    } else if (this.supabaseDb) {
      await this.supabaseDb.deleteOtpSession(id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async cleanupExpiredOtpSessions(): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.cleanupExpiredOtpSessions();
    } else if (this.supabaseDb) {
      await this.supabaseDb.cleanupExpiredOtpSessions();
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
    } else if (this.supabaseDb) {
      await this.supabaseDb.createChat(chatData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getChatById(id: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getChatById(id);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getChatById(id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getChatByParticipants(user1Id: string, user2Id: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getChatByParticipants(user1Id, user2Id);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getChatByParticipants(user1Id, user2Id);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getUserChats(userId: string): Promise<any[]> {
    if (this.sqliteDb) {
      return this.sqliteDb.getUserChats(userId);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getUserChats(userId);
    } else {
      throw new Error('Database not configured');
    }
  }

  async updateChatUpdatedAt(chatId: string): Promise<void> {
    if (this.sqliteDb) {
      await this.sqliteDb.updateChatUpdatedAt(chatId);
    } else if (this.supabaseDb) {
      await this.supabaseDb.updateChatUpdatedAt(chatId);
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
    } else if (this.supabaseDb) {
      await this.supabaseDb.createMessage(messageData);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getMessages(chatId: string, limit?: number, offset?: number): Promise<any[]> {
    if (this.sqliteDb) {
      return this.sqliteDb.getMessages(chatId, limit, offset);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getMessages(chatId, limit, offset);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getMessagesBefore(chatId: string, beforeMessageId: string, limit?: number): Promise<any[]> {
    if (this.sqliteDb) {
      return this.sqliteDb.getMessagesBefore(chatId, beforeMessageId, limit);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getMessagesBefore(chatId, beforeMessageId, limit);
    } else {
      throw new Error('Database not configured');
    }
  }

  async getLastMessage(chatId: string): Promise<any> {
    if (this.sqliteDb) {
      return this.sqliteDb.getLastMessage(chatId);
    } else if (this.supabaseDb) {
      return this.supabaseDb.getLastMessage(chatId);
    } else {
      throw new Error('Database not configured');
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseServiceWrapper();
