import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

export class SQLiteDatabase {
  private db: sqlite3.Database;
  private dbPath: string;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    this.ensureDataDirectory();
    this.db = new sqlite3.Database(dbPath);
    this.initializeTables();
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  private async initializeTables(): Promise<void> {
    const run = promisify(this.db.run.bind(this.db));
    
    try {
      // Create users table
      await run(`
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          firstName TEXT NOT NULL,
          lastName TEXT NOT NULL,
          email TEXT UNIQUE NOT NULL,
          phone TEXT UNIQUE NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create OTP sessions table
      await run(`
        CREATE TABLE IF NOT EXISTS otp_sessions (
          id TEXT PRIMARY KEY,
          phone TEXT NOT NULL,
          otp TEXT NOT NULL,
          expiresAt DATETIME NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      console.log('✅ Database tables initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database tables:', error);
      throw error;
    }
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async close(): Promise<void> {
    const close = promisify(this.db.close.bind(this.db));
    return close();
  }

  // User operations
  async createUser(userData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }): Promise<void> {
    await this.run(
      `INSERT INTO users (id, firstName, lastName, email, phone) VALUES (?, ?, ?, ?, ?)`,
      [userData.id, userData.firstName, userData.lastName, userData.email, userData.phone]
    );
  }

  async getUserById(id: string): Promise<any> {
    return this.get('SELECT * FROM users WHERE id = ?', [id]);
  }

  async getUserByEmail(email: string): Promise<any> {
    return this.get('SELECT * FROM users WHERE email = ?', [email]);
  }

  async getUserByPhone(phone: string): Promise<any> {
    return this.get('SELECT * FROM users WHERE phone = ?', [phone]);
  }

  async updateUser(id: string, updates: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }>): Promise<any> {
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE users SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;
    
    await this.run(sql, [...values, id]);
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.run('DELETE FROM users WHERE id = ?', [id]);
    return (result as any).changes > 0;
  }

  // OTP operations
  async createOtpSession(sessionData: {
    id: string;
    phone: string;
    otp: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.run(
      `INSERT INTO otp_sessions (id, phone, otp, expiresAt) VALUES (?, ?, ?, ?)`,
      [sessionData.id, sessionData.phone, sessionData.otp, sessionData.expiresAt.toISOString()]
    );
  }

  async getOtpSession(phone: string): Promise<any> {
    return this.get(
      'SELECT * FROM otp_sessions WHERE phone = ? AND expiresAt > CURRENT_TIMESTAMP ORDER BY createdAt DESC LIMIT 1',
      [phone]
    );
  }

  async deleteOtpSession(id: string): Promise<void> {
    await this.run('DELETE FROM otp_sessions WHERE id = ?', [id]);
  }

  async cleanupExpiredOtpSessions(): Promise<void> {
    await this.run('DELETE FROM otp_sessions WHERE expiresAt <= CURRENT_TIMESTAMP');
  }
}

// Singleton instance
let dbInstance: SQLiteDatabase | null = null;

export const getDatabase = (dbPath: string): SQLiteDatabase => {
  if (!dbInstance) {
    dbInstance = new SQLiteDatabase(dbPath);
  }
  return dbInstance;
};
