import { databaseService } from './index';

/**
 * Database Migration System
 * Handles schema changes for existing databases
 */

export interface Migration {
  version: number;
  name: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

class MigrationManager {
  private migrations: Migration[] = [];

  constructor() {
    this.registerMigrations();
  }

  private registerMigrations() {
    // Migration 1: Add social authentication fields
    this.migrations.push({
      version: 1,
      name: 'Add social authentication fields',
      up: async () => {
        console.log('🔄 Running migration 1: Add social authentication fields');
        
        // Check if columns already exist before adding them
        const tableInfo = await databaseService.all("PRAGMA table_info(users)");
        const existingColumns = tableInfo.map((col: any) => col.name);
        
        // Add authProvider column if it doesn't exist
        if (!existingColumns.includes('authProvider')) {
          await databaseService.run(`
            ALTER TABLE users ADD COLUMN authProvider TEXT DEFAULT 'phone'
          `);
          console.log('✅ Added authProvider column');
        }
        
        // Add socialId column if it doesn't exist
        if (!existingColumns.includes('socialId')) {
          await databaseService.run(`
            ALTER TABLE users ADD COLUMN socialId TEXT
          `);
          console.log('✅ Added socialId column');
        }
        
        // Add profilePictureUrl column if it doesn't exist
        if (!existingColumns.includes('profilePictureUrl')) {
          await databaseService.run(`
            ALTER TABLE users ADD COLUMN profilePictureUrl TEXT
          `);
          console.log('✅ Added profilePictureUrl column');
        }
        
        // Update existing users to have phone as unique (if not already)
        // Note: SQLite doesn't support adding UNIQUE constraints to existing columns easily
        // We'll handle this in the application logic
        
        console.log('✅ Migration 1 completed successfully');
      },
      down: async () => {
        console.log('🔄 Rolling back migration 1: Remove social authentication fields');
        
        // Note: SQLite doesn't support DROP COLUMN in older versions
        // This is a simplified rollback - in production you might want to create a new table
        console.log('⚠️  Rollback not fully supported for SQLite. Manual intervention required.');
      }
    });
  }

  async runMigrations(): Promise<void> {
    try {
      // Create migrations table if it doesn't exist
      await databaseService.run(`
        CREATE TABLE IF NOT EXISTS migrations (
          version INTEGER PRIMARY KEY,
          name TEXT NOT NULL,
          executed_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Get executed migrations
      const executedMigrations = await databaseService.all(`
        SELECT version FROM migrations ORDER BY version
      `);
      const executedVersions = new Set(executedMigrations.map((m: any) => m.version));

      // Run pending migrations
      for (const migration of this.migrations) {
        if (!executedVersions.has(migration.version)) {
          console.log(`🚀 Running migration ${migration.version}: ${migration.name}`);
          
          try {
            await migration.up();
            
            // Record migration as executed
            await databaseService.run(`
              INSERT INTO migrations (version, name) VALUES (?, ?)
            `, [migration.version, migration.name]);
            
            console.log(`✅ Migration ${migration.version} completed successfully`);
          } catch (error) {
            console.error(`❌ Migration ${migration.version} failed:`, error);
            throw error;
          }
        } else {
          console.log(`⏭️  Migration ${migration.version} already executed, skipping`);
        }
      }
      
      console.log('🎉 All migrations completed successfully');
    } catch (error) {
      console.error('💥 Migration failed:', error);
      throw error;
    }
  }

  async getMigrationStatus(): Promise<{ version: number; name: string; executed_at: string }[]> {
    try {
      return await databaseService.all(`
        SELECT version, name, executed_at FROM migrations ORDER BY version
      `);
    } catch (error) {
      // If migrations table doesn't exist, return empty array
      return [];
    }
  }
}

// Export singleton instance
export const migrationManager = new MigrationManager();
