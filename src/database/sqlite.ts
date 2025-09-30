import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

export class SQLiteDatabase {
  private db: sqlite3.Database;
  private dbPath: string;
  private initialized: boolean = false;

  constructor(dbPath: string) {
    this.dbPath = dbPath;
    
    // Only ensure data directory for file-based databases
    if (dbPath !== ':memory:') {
      this.ensureDataDirectory();
    }
    
    this.db = new sqlite3.Database(dbPath);
    this.initializeTables();
  }

  private async initializeTables(): Promise<void> {
    if (this.initialized) return;
    
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

      // Create chats table
      await run(`
        CREATE TABLE IF NOT EXISTS chats (
          id TEXT PRIMARY KEY,
          user1Id TEXT NOT NULL,
          user2Id TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user1Id) REFERENCES users (id),
          FOREIGN KEY (user2Id) REFERENCES users (id),
          UNIQUE (user1Id, user2Id)
        )
      `);

      // Create messages table
      await run(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          chatId TEXT NOT NULL,
          senderId TEXT NOT NULL,
          content TEXT NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (chatId) REFERENCES chats (id),
          FOREIGN KEY (senderId) REFERENCES users (id)
        )
      `);

      this.initialized = true;
      if (process.env['NODE_ENV'] !== 'test') {
        console.log('✅ Database tables initialized successfully');
      }
    } catch (error) {
      console.error('❌ Error initializing database tables:', error);
      throw error;
    }
  }

  private async ensureInitialized(): Promise<void> {
    if (!this.initialized) {
      await this.initializeTables();
    }
  }

  private ensureDataDirectory(): void {
    const dataDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }



  async run(sql: string, params: any[] = []): Promise<any> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve(this);
      });
    });
  }

  async get(sql: string, params: any[] = []): Promise<any> {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async all(sql: string, params: any[] = []): Promise<any[]> {
    await this.ensureInitialized();
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

  // Chat operations
  async createChat(chatData: {
    id: string;
    user1Id: string;
    user2Id: string;
  }): Promise<void> {
    await this.run(
      `INSERT INTO chats (id, user1Id, user2Id) VALUES (?, ?, ?)`,
      [chatData.id, chatData.user1Id, chatData.user2Id]
    );
  }

  async getChatById(id: string): Promise<any> {
    return this.get('SELECT * FROM chats WHERE id = ?', [id]);
  }

  async getChatByParticipants(user1Id: string, user2Id: string): Promise<any> {
    return this.get(
      `SELECT * FROM chats WHERE 
       (user1Id = ? AND user2Id = ?) OR 
       (user1Id = ? AND user2Id = ?)`,
      [user1Id, user2Id, user2Id, user1Id]
    );
  }

  async getUserChats(userId: string): Promise<any[]> {
    return this.all(
      `SELECT c.*, 
              CASE 
                WHEN c.user1Id = ? THEN c.user2Id 
                ELSE c.user1Id 
              END as otherUserId
       FROM chats c 
       WHERE c.user1Id = ? OR c.user2Id = ?
       ORDER BY c.updatedAt DESC`,
      [userId, userId, userId]
    );
  }

  async updateChatUpdatedAt(chatId: string): Promise<void> {
    await this.run(
      'UPDATE chats SET updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [chatId]
    );
  }

  // Message operations
  async createMessage(messageData: {
    id: string;
    chatId: string;
    senderId: string;
    content: string;
  }): Promise<void> {
    await this.run(
      `INSERT INTO messages (id, chatId, senderId, content) VALUES (?, ?, ?, ?)`,
      [messageData.id, messageData.chatId, messageData.senderId, messageData.content]
    );
  }

  async getChatMessages(chatId: string, limit: number = 50, offset: number = 0): Promise<any[]> {
    return this.all(
      'SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [chatId, limit, offset]
    );
  }

  async getLastMessageForChat(chatId: string): Promise<any> {
    return this.get(
      'SELECT * FROM messages WHERE chatId = ? ORDER BY createdAt DESC LIMIT 1',
      [chatId]
    );
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
