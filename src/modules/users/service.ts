import { DatabaseUserService } from './databaseService';
import { BusinessUserService } from './businessService';

// Create the appropriate data service based on configuration
// For 'in-memory' type, use DatabaseUserService with SQLite :memory: database
// This ensures consistency with the database service used by auth
const dataService = new DatabaseUserService();

// Export business service that wraps the data service
export const userService = new BusinessUserService(dataService);
