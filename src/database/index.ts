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
}

// Export singleton instance
export const databaseService = new DatabaseServiceWrapper();
